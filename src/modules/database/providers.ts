import * as mongoose from 'mongoose';
import { ISecretsService } from '../global/secrets/adapter';
import { ConnectionName } from './enum';
import { DATABASE_CONNECTION } from './constant';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (secretService: ISecretsService): Promise<typeof mongoose> =>
      mongoose.connect(
        `mongodb://${secretService.database.user}:${secretService.database.pass}@${secretService.database.host}:${secretService.database.port}/${ConnectionName.AUTH}?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&authSource=admin&authMechanism=SCRAM-SHA-256`,
      ),
    inject: [ISecretsService],
  },
];
