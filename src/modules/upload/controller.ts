import {
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('upload')
@Public()
@ApiTags('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
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
          new FileTypeValidator({ fileType: /(image\/jpeg|image\/png|application\/json)/ }),
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
  @Public()
  @Post('/rooms/:roomId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoomFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 50 }),
          new FileTypeValidator({ fileType: /(image\/jpeg|image\/png|application\/json)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('roomId') roomId: string,
  ) {
    const prefix = `rooms/${roomId}`;
    const result = await this.uploadService.upload(file.buffer, file.originalname, prefix);
    return {
      result,
      message: `Success`,
    };
  }
}
