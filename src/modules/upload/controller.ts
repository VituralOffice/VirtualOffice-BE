import { Controller, HttpCode, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { IUploadService } from './adapter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('upload')
@ApiTags("upload")
export class UploadController {
  constructor(private readonly uploadService: IUploadService) {}
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'jpeg',
    })
    .addFileTypeValidator({
      fileType: 'png',
    })
    .addMaxSizeValidator({
      maxSize: 50*1024
    })
    .build({
      errorHttpStatusCode: 422
    }),
  ) file: Express.Multer.File) {
    const result = await this.uploadService.upload(file.buffer, file.originalname);
    return {
      result,
      message: `Success`,
    };
  }
}
