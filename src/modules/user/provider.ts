import { Connection } from 'mongoose';
import { UserSchema } from './schema';
import { USER_MODEL } from './constant';
import { ConnectionName } from '../database/enum';
import { User } from 'src/common/decorators/current-user.decorator';
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
