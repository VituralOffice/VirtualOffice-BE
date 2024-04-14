import { Module } from "@nestjs/common";
import { UploadController } from "./controller";
import { UploadService } from "./service";
import { SecretsModule } from "../global/secrets/module";
import { AWSModule } from "../aws/module";
import { IUploadService } from "./adapter";
import { AWSService } from "../aws/service";
import { ISecretsService } from "../global/secrets/adapter";

@Module({
  controllers: [UploadController],
  providers: [{
    provide: IUploadService,
    useFactory: (awsService: AWSService, secretsService: ISecretsService)=> new UploadService(awsService, secretsService),
    inject: [AWSService, ISecretsService]
  }],
  imports: [SecretsModule, AWSModule]
})
export class UploadModule {

}