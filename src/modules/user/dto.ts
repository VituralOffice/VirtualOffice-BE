import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    nullable: true,
  })
  fullname?: string;
  @ApiProperty({
    nullable: true,
    description: 'Id character',
  })
  character?: string;
}
