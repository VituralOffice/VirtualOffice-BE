import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { bold } from 'colorette';
import { ILoggerService } from './modules/global/logger/adapter';
import { ISecretsService } from './modules/global/secrets/adapter';
import { DEFAULT_TAG, SWAGGER_API_ROOT } from './common/documentation/constants';
import { AppExceptionFilter } from './common/filters/http-exception.filter';
import { ExceptionInterceptor } from './common/interceptors/exception/http-exception.interceptor';
import { HttpLoggerInterceptor } from './common/interceptors/logger/http-logger.interceptor';
import { TracingInterceptor } from './common/interceptors/logger/http-tracing.interceptor';
import { MainModule } from './modules/module';
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from './constant';
import { Server as ColyseusServer, LobbyRoom, RedisPresence, MongooseDriver } from 'colyseus';
import { IncomingMessage, ServerResponse } from 'http';
import { monitor } from '@colyseus/monitor';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import cookieParser from 'cookie-parser';
import { IMapData, RoomType } from './types/Rooms';
import { VOffice, injectDeps } from './modules/rooms/VOffice';
import { RedisIoAdapter } from './adapter';
import { ICacheService } from './modules/cache/adapter';
async function bootstrap() {
  const app = express();
  const nest = await NestFactory.create(MainModule, new ExpressAdapter(app), { bodyParser: true });
  const redisIoAdapter = new RedisIoAdapter(nest);
  nest.useWebSocketAdapter(redisIoAdapter);
  const loggerService = nest.get(ILoggerService);
  const secretsService = nest.get(ISecretsService);
  const cacheService = nest.get(ICacheService);
  const whitelist = secretsService.ORIGINS.split(',') || ['*'];
  const corsOptions = {
    origin: whitelist,
    credentials: true,
  };
  const corsMiddleware = cors(corsOptions);
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);
  //stripe webhook
  app.use('/v1/payments/stripe_webhook', express.raw({ type: 'application/json' }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/colyseus', monitor());
  const httpServer = http.createServer(app);
  const server = new Server({
    server: httpServer,
    presence: new RedisPresence(cacheService.getConfig()),
    driver: new MongooseDriver(secretsService.database.uri),
  });
  server.define(RoomType.LOBBY, LobbyRoom);
  server.define(RoomType.PUBLIC, VOffice, {
    _id: '',
    active: true,
    creator: '',
    members: [],
    name: 'Public Lobby',
    map: {} as IMapData,
    private: false,
    autoDispose: false,
  });
  server.define(RoomType.CUSTOM, injectDeps(nest, VOffice)).enableRealtimeListing();
  nest.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.PRECONDITION_FAILED,
      transform: true,
    }),
  );

  loggerService.setApplication(APP_NAME);
  //nest.enableCors({});
  nest.useGlobalFilters(new AppExceptionFilter(loggerService, secretsService));
  nest.useGlobalInterceptors(
    new ExceptionInterceptor(),
    new HttpLoggerInterceptor(loggerService),
    new TracingInterceptor({ app: APP_NAME, version: APP_VERSION }, loggerService),
  );
  const {
    authAPI: { port: PORT, url },
    ENV,
    KIBANA_URL,
    JEAGER_URL,
    MONGO_EXPRESS_URL,
    REDIS_COMMANDER_URL,
  } = nest.get(ISecretsService);
  nest.useLogger(loggerService);
  nest.useGlobalPipes(new ValidationPipe({ errorHttpStatusCode: HttpStatus.PRECONDITION_FAILED }));
  nest.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  const config = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .addTag(DEFAULT_TAG)
    .build();
  const document = SwaggerModule.createDocument(nest, config);
  SwaggerModule.setup(SWAGGER_API_ROOT, nest, document);
  loggerService.log(`🟢 ${APP_NAME} listening at ${bold(PORT)} on ${bold(ENV?.toUpperCase())} 🟢\n`);
  await nest.init();
  await server.listen(PORT);
  const openApiURL = `${url}/${SWAGGER_API_ROOT}`;
  loggerService.log(`🔵 swagger listening at ${bold(openApiURL)}`);
  loggerService.log(`🔵 mongo-express listening at ${bold(MONGO_EXPRESS_URL)}`);
  loggerService.log(`🔵 redis-commander listening at ${bold(REDIS_COMMANDER_URL)}`);
  loggerService.log(`🔵 kibana listening at ${bold(KIBANA_URL)}`);
  loggerService.log(`🔵 jeager listening at ${bold(JEAGER_URL)}`);
}

bootstrap();

export class Server extends ColyseusServer {
  protected async handleMatchMakeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const headers = {
      'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, Accept, Accept-Encoding, Accept-Language, Authorization,Baggage,Refere,Sec-Ch-Ua,Sec-Ch-Ua-Mobile,Sec-Ch-Ua-Platform,Sentry-Trace, User-Agent ',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': 2592000,
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
    } else {
      return super.handleMatchMakeRequest(req, res);
    }
  }
}
