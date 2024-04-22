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
import { Server, LobbyRoom } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as express from 'express';
import * as cors from 'cors';
import * as http from 'node:http';
import { RoomType } from './types/Rooms';
import { VOffice } from './modules/rooms/VOffice';
import { RedisIoAdapter } from './adapter';
async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/colyseus', monitor());
  const nest = await NestFactory.create(MainModule, new ExpressAdapter(app));
  const redisIoAdapter = new RedisIoAdapter(nest);
  nest.useWebSocketAdapter(redisIoAdapter);
  const httpServer = http.createServer(app);
  const server = new Server({
    server: httpServer,
  });
  // add multer middleware
  const upload = multer();
  app.use('/v1/upload', upload.single('file'));
  server.define(RoomType.LOBBY, LobbyRoom);
  server.define(RoomType.PUBLIC, VOffice, {
    name: 'Public Lobby',
    description: 'For making friends and familiarizing yourself with the controls',
    password: null,
    autoDispose: false,
  });
  server.define(RoomType.CUSTOM, VOffice).enableRealtimeListing();
  nest.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.PRECONDITION_FAILED,
    }),
  );
  const loggerService = nest.get(ILoggerService);
  const secretsService = nest.get(ISecretsService);

  loggerService.setApplication(APP_NAME);
  nest.enableCors();
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
