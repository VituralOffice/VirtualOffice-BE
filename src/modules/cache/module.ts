import { Module } from '@nestjs/common';

import { ILoggerService } from '../global/logger/adapter';
import { ISecretsService } from '../global/secrets/adapter';
import { ICacheService } from './adapter';
import { RedisService } from './service';

@Module({
  providers: [
    {
      provide: ICacheService,
      useFactory: async ({ redis }: ISecretsService, logger: ILoggerService) => {
        const cacheService = new RedisService(redis, logger);
        await cacheService.connect();
        return cacheService;
      },
      inject: [ISecretsService, ILoggerService],
    },
  ],
  exports: [ICacheService],
})
export class RedisModule {}
