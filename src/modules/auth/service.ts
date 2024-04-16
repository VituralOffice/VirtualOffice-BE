import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from 'src/common';

import { IUserRepository } from '../user/adapter';
import { UserEntity } from '../user/entity';
import { IAuthService, TokenResult } from './adapter';
import { CreateUserDto, LoginDto } from './dto';
import { comparePassword, hashPassword, randomHash } from 'src/common/crypto/bcrypt';
import { ITokenService } from '../token/adapter';
import { ISecretsService } from '../global/secrets/adapter';
import { TOKEN_TYPE } from '../token/enum';
import { JwtPayload } from './jwt/jwt.strategy';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly secretService: ISecretsService,
    private readonly mailService: MailerService,
  ) {}

  async login(payload: LoginDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      email: payload.email,
    });
    if (!user) throw new ApiException(`user not found`, HttpStatus.NOT_FOUND);
    if (!comparePassword(payload.password, user.password))
      throw new ApiException(`invalid password`, HttpStatus.BAD_REQUEST);
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
  async register(payload: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      email: payload.email,
    });
    if (user) throw new ApiException(`email already exist`, HttpStatus.BAD_REQUEST);
    const newUser = new UserEntity();
    newUser.email = payload.email;
    newUser.fullname = payload.fullname;
    newUser.password = hashPassword(payload.password);
    return this.userRepository.create(newUser);
  }
  // todo: verify registered user
  async sendConfirmLink(payload: UserEntity): Promise<void> {
    const confirmToken = randomHash();
    const url = `${this.secretService.APP_URL}/confirm_email?token=${confirmToken}`
    await this.tokenService.save({
      token: confirmToken,
      type: TOKEN_TYPE.CONFIRM,
      user: payload,
    });
    // ignore
    // todo: handle mail correctly
    this.mailService.sendMail({
      to: payload.email,
      subject: 'Confirm your email',
      template: 'confirm_email',
      context: {
        url,
      },
    });
  }
  async verifyEmail(token: string): Promise<UserEntity> {
    const tokenDoc = await this.tokenService.findTokenConfirm(token);
    if (!tokenDoc) throw new ApiException(`token invalid`, 404)
    const user = await this.userRepository.findById(tokenDoc.user);
    if (!user) throw new ApiException(`user not found`, 404)
    user.isVerified = true;
    await user.save()
    return user
  }
}
