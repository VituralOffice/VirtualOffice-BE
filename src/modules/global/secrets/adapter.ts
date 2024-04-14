export abstract class ISecretsService {
  ENV: string;
  REDIS_URL: string;
  ELK_URL: string;

  MONGO_EXPRESS_URL: string;
  JEAGER_URL: string;
  REDIS_COMMANDER_URL: string;
  KIBANA_URL: string;

  LOG_LEVEL: string;

  database: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };

  mainAPI: {
    port: number;
    url: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpires: string; //
    refreshExpires: string; // number in minutes
  };
  authAPI: {
    port: number;
    jwtToken: string;
    url: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
  GITHUB_SCRAP_API: string;
}
