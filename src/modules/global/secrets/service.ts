import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LevelWithSilent } from 'pino';

import { ISecretsService } from './adapter';
import { AuthAPIEnvironment, CatsAPIEnvironment } from './enum';

@Injectable()
export class SecretsService extends ConfigService implements ISecretsService {
  constructor() {
    super();
  }

  ELK_URL = this.get('ELK_URL');

  MONGO_EXPRESS_URL = this.get('MONGO_EXPRESS_URL');
  REDIS_COMMANDER_URL = this.get('REDIS_COMMANDER_URL');
  JEAGER_URL = this.get('JEAGER_URL');
  KIBANA_URL = this.get('KIBANA_URL');

  REDIS_URL = this.get('REDIS_URL');

  ENV = this.get('ENV');

  LOG_LEVEL = this.get<LevelWithSilent>('LOG_LEVEL');

  database = {
    host: this.get('MONGO_HOST'),
    port: this.get<number>('MONGO_PORT'),
    user: this.get('MONGO_INITDB_ROOT_USERNAME'),
    pass: this.get('MONGO_INITDB_ROOT_PASSWORD'),
  };

  mainAPI = {
    port: this.get<number>(CatsAPIEnvironment.PORT),
    url: this.get(CatsAPIEnvironment.URL),
  };

  authAPI = {
    port: this.get<number>(AuthAPIEnvironment.PORT),
    jwtToken: this.get(AuthAPIEnvironment.SECRET_JWT),
    url: this.get(AuthAPIEnvironment.URL),
  };
  jwt = {
    accessSecret: this.get<string>(`JWT_ACCESS_SECRET`),
    refreshSecret: this.get<string>(`JWT_REFRESH_SECRET`),
    accessExpires: this.get<string>(`JWT_ACCESS_EXPIRES`),
    refreshExpires: this.get<string>(`JWT_REFRESH_EXPIRES`),
  };
  aws = {
    accessKeyId: this.get<string>(`AWS_ACCESS_KEY_ID`),
    secretAccessKey: this.get<string>(`AWS_SECRET_ACCESS_KEY`),
    region: this.get<string>(`AWS_REGION`),
    bucketName: this.get<string>(`AWS_BUCKET_NAME`),
  };
  GITHUB_SCRAP_API = this.get('GITHUB_SCRAP_API');
}
