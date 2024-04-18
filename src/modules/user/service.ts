import { Inject, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto';
import { ApiException } from 'src/common';
import { UserEntity } from './entity';
import { User, UserModel } from './schema';
import { USER_MODEL } from './constant';
import { CharacterModel } from '../character/schema';
import { CHARACTER_MODEL } from '../character/constant';
import { use } from 'passport';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL) private readonly userModel: UserModel,
    @Inject(CHARACTER_MODEL) private readonly characterModel: CharacterModel,
  ) {}
  async create(data: Partial<UserEntity>) {
    const user = new this.userModel(data);
    return user.save();
  }
  async findById(id: string) {
    return this.userModel.findById(id);
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (data.character) {
      const character = await this.characterModel.findById(data.character);
      if (!character) throw new ApiException(`character not found`);
      user.character = data.character;
    }
    if (data.fullname) user.fullname = user.fullname;
    await user.save();
    return user;
  }
  async getProfile(user: UserEntity) {
    return this.userModel.findById(user.id).populate(`character`);
  }
}
