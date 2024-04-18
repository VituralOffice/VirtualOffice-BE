import { Connection } from 'mongoose';
import { Token, TokenSchema } from './schema';
import { TOKEN_MODEL } from './constant';
import { DATABASE_CONNECTION } from '../database/constant';
import { TokenService } from './service';

export const tokenProviders = [
  {
    provide: TOKEN_MODEL,
    useFactory: (connection: Connection) => connection.model(Token.name, TokenSchema),
    inject: [DATABASE_CONNECTION],
  },
  TokenService,
];
