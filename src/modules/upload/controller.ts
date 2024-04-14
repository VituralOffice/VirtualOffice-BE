import {
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { IUploadService } from './adapter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('upload')
@ApiTags('upload')
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
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 50 }),
          new FileTypeValidator({ fileType: /image\/jpeg|png/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadService.upload(file.buffer, file.originalname);
    return {
      result,
      message: `Success`,
    };
  }
}
