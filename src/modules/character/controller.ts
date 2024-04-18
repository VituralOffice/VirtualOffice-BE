import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CharacterService } from './service';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateCharacterDto } from './dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLE } from 'src/common/enum/role';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('characters')
@Controller({ path: 'characters' })
export class CharacterController {
  constructor(private characterService: CharacterService) {}
  @Get()
  @Public()
  async findAll() {
    const characters = await this.characterService.findAll();
    return {
      result: characters,
      message: `Success`,
    };
  }
  @Post()
  @ApiBody({ type: CreateCharacterDto })
  @Roles([ROLE.ADMIN])
  async create(@Body() body: CreateCharacterDto) {
    const character = await this.characterService.create(body);
    return {
      result: character,
      message: `Success`,
    };
  }
}
