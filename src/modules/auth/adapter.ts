import { CreatedModel } from '../database/types';
import { UserEntity } from '../user/entity';
import { LoginDto, CreateUserDto } from './dto';
export type TokenResult = {
  accessToken: string;
  refreshToken: string;
};
export abstract class IAuthService {
  abstract login(payload: LoginDto): Promise<UserEntity>;
  abstract register(payload: CreateUserDto): Promise<UserEntity>;
  abstract signPairToken(payload: UserEntity): Promise<TokenResult>;
  // abstract verify(token: string): Promise<UserEntity>;
}
