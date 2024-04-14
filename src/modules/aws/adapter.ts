import { S3 } from 'aws-sdk';

export abstract class IAWSService {
  abstract getS3(): S3;
}
