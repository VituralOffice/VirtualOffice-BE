import { Inject, Injectable } from '@nestjs/common';
import { CharacterEntity } from './entity';
import { CreateCharacterDto } from './dto';
import { ApiException } from 'src/common';
import { CHARACTER_MODEL } from './constant';
import { Character, CharacterModel } from './schema';

@Injectable()
export class CharacterService {
  constructor(@Inject(CHARACTER_MODEL) private readonly characterModel: CharacterModel) {}
  findAll(): Promise<CharacterEntity[]> {
    return this.characterModel.find();
  }
  async create(data: CreateCharacterDto): Promise<CharacterEntity> {
    const existName = await this.characterModel.findOne({ name: data.name });
    if (existName) throw new ApiException(`Exist character name`, 400);
    return this.characterModel.create(data);
  }
  async findById(id: string) {
    return this.characterModel.findById(id);
  }
  async findRandomOne() {
    const character = await this.characterModel.aggregate().sample(1);
    return character as any as CharacterEntity;
  }
}
