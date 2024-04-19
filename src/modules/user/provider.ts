import { Connection } from 'mongoose';
import { UserSchema, User } from './schema';
import { USER_MODEL } from './constant';
import { UserService } from './service';
import { DATABASE_CONNECTION } from '../database/constant';

export const userProviders = [
  {
    provide: USER_MODEL,
    useFactory: (connection: Connection) => connection.model(User.name, UserSchema),
    inject: [DATABASE_CONNECTION],
  },
  UserService,
];
