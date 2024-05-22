import { Injectable, UploadedFile } from '@nestjs/common';
import { AWSService } from '../aws/service';
import slugify from 'slugify';
import { ISecretsService } from '../global/secrets/adapter';
export type FileUploadResult = {
  path: string;
  url: string;
};
@Injectable()
export class UploadService {
  constructor(private readonly awsService: AWSService, private readonly secretesService: ISecretsService) {}
  async upload(buffer: Buffer, fileName: string, prefix = ''): Promise<FileUploadResult> {
    const { Key, Location } = await this.uploadS3(buffer, this.secretesService.aws.bucketName, fileName, prefix);
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
  async uploadS3(file: Buffer, bucket: string, name: string, prefix = '') {
    const s3 = this.awsService.getS3();
    const params = {
      Bucket: bucket,
      Key: prefix ? `${prefix}/${this.addTimestampFilename(name)}` : this.addTimestampFilename(name),
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
