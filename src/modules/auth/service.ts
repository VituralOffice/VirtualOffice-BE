import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from 'src/common';

import { IUserRepository } from '../user/adapter';
import { UserEntity } from '../user/entity';
import { IAuthService, OtpPayload, TokenResult } from './adapter';
import { CreateUserDto, LoginDto } from './dto';
import { genOtp, hashPassword } from 'src/common/crypto/bcrypt';
import { ITokenService } from '../token/adapter';
import { ISecretsService } from '../global/secrets/adapter';
import { TOKEN_TYPE } from '../token/enum';
import { JwtPayload } from './jwt/jwt.strategy';
import { MailerService } from '@nestjs-modules/mailer';
import { ICacheService } from '../cache/adapter';
import { ExceedIncorrectOtpTryException, OtpExpiredException, UserNotFoundException } from './exception';
const OTP_TTL = 30 * 60; //30m
const INCORRECT_ENTER_OTP_TIME = 5
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly secretService: ISecretsService,
    private readonly mailService: MailerService,
    private readonly cacheService: ICacheService
  ) {}

  async login(payload: LoginDto): Promise<UserEntity> {
    let user = await this.userRepository.findOne({
      email: payload.email,
    });
    if (!user) {
      const userEntity = new UserEntity()
      userEntity.email = payload.email;
      userEntity.provider = 'local';
      user = await this.userRepository.create(userEntity)
    }
    return user;
  }
  async signPairToken(user: UserEntity): Promise<TokenResult> {
    // revoke previous token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };
    await this.tokenService.revoke(user);
    const accessToken = this.tokenService.sign(payload, this.secretService.jwt.accessSecret, {
      algorithm: 'HS256',
      expiresIn: this.secretService.jwt.accessExpires,
    });
    const refreshToken = this.tokenService.sign(payload, this.secretService.jwt.refreshSecret, {
      algorithm: 'HS256',
      expiresIn: this.secretService.jwt.refreshExpires,
    });
    // save to db
    await this.tokenService.save({ token: accessToken, type: TOKEN_TYPE.ACCESS, user });
    await this.tokenService.save({ token: refreshToken, type: TOKEN_TYPE.REFRESH, user });
    return {
      accessToken,
      refreshToken,
    };
  }
  async genOtp(payload: UserEntity): Promise<string> {
    const otp = genOtp()
    const key = `user_with_email_${payload.email}`;
    await this.cacheService.set(key, otp, { EX: OTP_TTL });
    return otp
  }
  // todo: verify registered user
  async sendOtp(payload: OtpPayload): Promise<void> {
    // todo: handle mail correctly
    this.mailService.sendMail({
      to: payload.email,
      from: `VOffice <${this.secretService.smtp.from}>`,
      subject: 'Your VOffice one-time password',
      template: 'otp',
      context: {
        otp: payload.otp,
      },
    });
  }
  async verifyOtp(payload: OtpPayload): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email: payload.email })
    if (!user) throw new UserNotFoundException()
    const otpKey = `user_with_email_${payload.email}`;
    const incorrectKey = `user_enter_otp_incorrect_${payload.email}`
    const otpCache = await this.cacheService.get(otpKey);
    if (!otpCache) throw new OtpExpiredException()
    if (otpCache !== payload.otp) {
      let incorrectTimeStr = await this.cacheService.get(incorrectKey) || '0';
      let incorrectTime = parseInt(incorrectTimeStr, 10)
      if (incorrectTime === INCORRECT_ENTER_OTP_TIME) throw new ExceedIncorrectOtpTryException()
      await this.cacheService.set(incorrectKey, String(++incorrectTime), {
        EX: OTP_TTL
      })
      throw new ApiException(`invalid otp`, 400)
    }
    user.isVerified = true;
    await user.save()
    this.cacheService.del(otpKey)
    this.cacheService.del(incorrectKey)
    return user
  }
}
