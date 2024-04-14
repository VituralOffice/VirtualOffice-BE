import { Module } from '@nestjs/common';
import { AWSService } from './service';
import { SecretsModule } from '../global/secrets/module';

@Module({
  providers: [AWSService],
  exports: [AWSService],
  imports: [SecretsModule],
})
export class AWSModule {}
