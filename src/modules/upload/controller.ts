import { Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { IUploadService } from './adapter';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: IUploadService) {}
  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.upload(file.buffer, file.originalname);
    return {
      result,
      message: `Success`,
    };
  }
}
