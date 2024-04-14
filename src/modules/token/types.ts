import { User } from '../user/schema';
import { TOKEN_TYPE } from './enum';

export type Token = {
  token: string;
};
export type SaveTokenPayload = {
  token: string;
  type: TOKEN_TYPE;
  isBlacklist?: boolean;
  user: User;
};
