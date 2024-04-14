import { Injectable, UploadedFile } from '@nestjs/common';
import { FileUploadResult, IUploadService } from './adapter';
import { AWSService } from '../aws/service';
import slugify from 'slugify';
import { ISecretsService } from '../global/secrets/adapter';

@Injectable()
export class UploadService implements IUploadService {
  constructor(private readonly awsService: AWSService, private readonly secretesService: ISecretsService) {}
  async upload(buffer: Buffer, fileName: string): Promise<FileUploadResult> {
    const { Key, Location } = await this.uploadS3(buffer, this.secretesService.aws.bucketName, fileName);
    return {
      path: Key,
      url: Location,
    };
  }
  async delete(key: string): Promise<void> {
    await this.awsService
      .getS3()
      .deleteObject({
        Bucket: this.secretesService.aws.bucketName,
        Key: key,
      })
      .promise();
  }
  async uploadS3(file: Buffer, bucket: string, name: string) {
    const s3 = this.awsService.getS3();
    const params = {
      Bucket: bucket,
      Key: this.addTimestampFilename(name),
      Body: file,
    };
    return s3.upload(params).promise();
  }
  addTimestampFilename(filename: string) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10e6);
    return `${timestamp}-${randomNum}-${slugify(filename)}`;
  }
}
