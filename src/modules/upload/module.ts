import { Module } from '@nestjs/common';
import { UploadController } from './controller';
import { UploadService } from './service';
import { SecretsModule } from '../global/secrets/module';
import { AWSModule } from '../aws/module';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    SecretsModule,
    AWSModule,
    MulterModule.register({
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
