import { Inject, Injectable } from '@nestjs/common';
import { ISecretsService } from '../global/secrets/adapter';
import { S3 } from 'aws-sdk';
@Injectable()
export class AWSService {
  constructor(private readonly secretsService: ISecretsService) {}
  getS3() {
    return new S3({
      credentials: {
        accessKeyId: this.secretsService.aws.accessKeyId,
        secretAccessKey: this.secretsService.aws.secretAccessKey,
      },
      region: this.secretsService.aws.region,
    });
  }
}
