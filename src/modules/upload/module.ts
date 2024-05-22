import { Module } from '@nestjs/common';
import { UploadController } from './controller';
import { UploadService } from './service';
import { SecretsModule } from '../global/secrets/module';
import { AWSModule } from '../aws/module';
@Module({
  imports: [SecretsModule, AWSModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
