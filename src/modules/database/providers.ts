import * as mongoose from 'mongoose';
import { ISecretsService } from '../global/secrets/adapter';
import { ConnectionName } from './enum';
import { DATABASE_CONNECTION } from './constant';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (secretService: ISecretsService): Promise<typeof mongoose> => {
      const uri = `mongodb://${secretService.database.user}:${secretService.database.pass}@${secretService.database.host}:${secretService.database.port}/${ConnectionName.AUTH}?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&authSource=admin&authMechanism=SCRAM-SHA-256`;
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };
      let conn: mongoose.Mongoose;
      try {
        conn = await mongoose.connect(uri, options);
      } catch (error) {
        console.error('Initial connection to MongoDB failed:', error);
      }
      conn.connection.on('connected', () => {
        console.log('Mongoose connected to ' + uri);
      });
      conn.connection.on('error', (err) => {
        console.error('Mongoose connection error: ' + err);
      });
      conn.connection.on('disconnected', () => {
        console.log('Mongoose disconnected. Attempting to reconnect...');
      });
      conn.connection.on('reconnected', () => {
        console.log('Mongoose reconnected.');
      });
      return conn;
    },
    inject: [ISecretsService],
  },
];
