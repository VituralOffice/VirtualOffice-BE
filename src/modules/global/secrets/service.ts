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
  API_URL = this.get('API_URL');
  APP_URL = this.get('APP_URL');
  MONGO_EXPRESS_URL = this.get('MONGO_EXPRESS_URL');
  REDIS_COMMANDER_URL = this.get('REDIS_COMMANDER_URL');
  JEAGER_URL = this.get('JEAGER_URL');
  KIBANA_URL = this.get('KIBANA_URL');
  STRIPE_PRIVATE_KEY = this.get('STRIPE_PRIVATE_KEY');
  STRIPE_SUCCESS_CALLBACK = this.get('STRIPE_SUCCESS_CALLBACK');
  STRIPE_CANCEL_CALLBACK = this.get('STRIPE_SUCCESS_CALLBACK');
  STRIPE_WEBHOOK_SECRET = this.get(`STRIPE_WEBHOOK_SECRET`);
  STRIPE_CUSTOMER_PORTAL = this.get(`STRIPE_CUSTOMER_PORTAL`);
  REDIS_URL = this.get('REDIS_URL');
  ENV = this.get('ENV');
  LOG_LEVEL = this.get<LevelWithSilent>('LOG_LEVEL');
  redis = {
    url: this.get(`REDIS_URL`),
    host: this.get(`REDIS_HOST`),
    port: parseInt(this.get(`REDIS_PORT`)),
    password: this.get(`REDIS_PASSWORD`),
  };
  database = {
    host: this.get('MONGO_HOST'),
    port: this.get<number>('MONGO_PORT'),
    user: this.get('MONGO_INITDB_ROOT_USERNAME'),
    pass: this.get('MONGO_INITDB_ROOT_PASSWORD'),
    name: this.get('MONGO_NAME'),
    uri: `mongodb://${this.get('MONGO_INITDB_ROOT_USERNAME')}:${this.get('MONGO_INITDB_ROOT_PASSWORD')}@${this.get(
      'MONGO_HOST',
    )}:${this.get('MONGO_PORT')}/${this.get(
      `MONGO_NAME`,
    )}?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&authSource=admin&authMechanism=SCRAM-SHA-256`,
  };
  ORIGINS = this.get<string>('ORIGINS');
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
    s3Endpoint: this.get<string>(`AWS_S3_ENDPOINT`),
  };
  oauthGoogle = {
    clientId: this.get<string>(`OAUTH_GOOGLE_ID`),
    clientSecret: this.get<string>(`OAUTH_GOOGLE_SECRET`),
    redirectUrl: this.get<string>(`OAUTH_GOOGLE_REDIRECT_URL`),
  };
  smtp = {
    host: this.get<string>(`SMTP_HOST`),
    port: this.get<number>(`SMTP_PORT`),
    auth: {
      user: this.get<string>(`SMTP_USER`),
      pass: this.get<string>(`SMTP_PASS`),
    },
    from: this.get<string>(`SMTP_FROM`),
  };
}
