import { UserEntity } from '../user/entity';
import { LoginDto } from './dto';
import * as path from 'path';
export type TokenResult = {
  accessToken: string;
  refreshToken: string;
};
export type OtpPayload = {
  otp: string;
  email: string;
};
export abstract class IAuthService {
  abstract login(payload: LoginDto): Promise<UserEntity>;
  abstract signPairToken(payload: UserEntity): Promise<TokenResult>;
  abstract sendOtp(payload: OtpPayload): Promise<void>;
  abstract verifyOtp(payload: OtpPayload): Promise<UserEntity>;
  abstract genOtp(payload: UserEntity): Promise<string>;
}
