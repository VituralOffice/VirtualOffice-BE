import { Inject, Injectable } from '@nestjs/common';
import { ISecretsService } from '../global/secrets/adapter';
import { S3, config } from 'aws-sdk';
import { IAWSService } from './adapter';

@Injectable()
export class AWSService implements IAWSService {
  constructor(private readonly secretsService: ISecretsService) {
    config.update({
      apiVersion: 'latest',
      credentials: {
        accessKeyId: this.secretsService.aws.accessKeyId,
        secretAccessKey: this.secretsService.aws.secretAccessKey,
      },
      region: this.secretsService.aws.region,
    });
  }
  getS3() {
    return new S3({
      endpoint: this.secretsService.aws.s3Endpoint,
      s3ForcePathStyle: true,
    });
  }
}
