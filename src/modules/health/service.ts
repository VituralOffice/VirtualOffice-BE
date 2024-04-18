import { Injectable } from '@nestjs/common';
import { ILoggerService } from 'src/modules/global/logger/adapter';

import { UserService } from '../user/service';
import { IHealthService } from './adapter';
import { APP_NAME, APP_VERSION } from 'src/constant';

@Injectable()
export class HealthService implements IHealthService {
  constructor(private readonly userService: UserService, private readonly loggerService: ILoggerService) {}

  async getText(): Promise<string> {
    const appName = `${APP_NAME}-${APP_VERSION} UP!!`;
    this.loggerService.info({
      message: appName,
      context: `HealthService/getText`,
    });
    return appName;
  }
}
