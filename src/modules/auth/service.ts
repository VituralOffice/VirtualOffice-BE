import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from 'src/common';

import { IUserRepository } from '../user/adapter';
import { UserEntity } from '../user/entity';
import { IAuthService, TokenResult } from './adapter';
import { CreateUserDto, LoginDto } from './dto';
import { comparePassword, hashPassword } from 'src/common/crypto/bcrypt';
import { ITokenService } from '../token/adapter';
import { ISecretsService } from '../global/secrets/adapter';
import { TOKEN_TYPE } from '../token/enum';
import { JwtPayload } from './jwt/jwt.strategy';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly secretService: ISecretsService,
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
}
