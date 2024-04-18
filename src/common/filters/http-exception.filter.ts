import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ILoggerService } from 'src/modules/global/logger/adapter';
import { DateTime } from 'luxon';

import { ApiException, ErrorModel } from '../exception';
import * as errorStatus from 'src/common/static/htttp-status.json';
import { ISecretsService } from 'src/modules/global/secrets/adapter';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: ILoggerService, private secretsService: ISecretsService) {}

  catch(exception: ApiException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : [exception['status'], HttpStatus.INTERNAL_SERVER_ERROR].find(Boolean);
    exception.traceid = [exception.traceid, request['id']].find(Boolean);
    this.loggerService.error(exception, exception.message, exception.context);
    response.status(status).json({
      code: status,
      result: null,
      message: exception.message,
      metadata:
        this.secretsService.ENV === 'development'
          ? {
              code: status,
              traceid: exception.traceid,
              message: [errorStatus[String(status)], exception.message].find(Boolean),
              timestamp: DateTime.fromJSDate(new Date()).setZone(process.env.TZ).toFormat('dd/MM/yyyy HH:mm:ss'),
              path: request.url,
            }
          : {},
    });
  }
}
