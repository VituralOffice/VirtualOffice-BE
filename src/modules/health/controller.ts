import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { IHealthService } from './adapter';
import { SwaggerResponse } from './swagger';

@Controller()
@ApiTags('health')
export class HealthController {
  constructor(private readonly healthService: IHealthService) {}

  @Get('/health')
  @ApiResponse(SwaggerResponse.getHealth[200])
  @ApiResponse(SwaggerResponse.getHealth[500])
  async getHealth(): Promise<string> {
    return this.healthService.getText();
  }
}
