import { Inject, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto';
import { ApiException } from 'src/common';
import { UserEntity } from './entity';
import { User, UserDocument, UserModel } from './schema';
import { USER_MODEL } from './constant';
import { CharacterModel } from '../character/schema';
import { CHARACTER_MODEL } from '../character/constant';
import { QueryDto } from '../admin/dto';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { PaginateResult } from 'src/common/paginate/pagnate';
import { ROLE } from 'src/common/enum/role';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL) private readonly userModel: UserModel,
    @Inject(CHARACTER_MODEL) private readonly characterModel: CharacterModel,
  ) {}
  async create(data: Partial<UserEntity>) {
    return this.userModel.create(data);
  }
  async findById(id: string) {
    return this.userModel.findById(id);
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
  async updateProfile(userId: string, data: UpdateProfileDto) {
    const updateQuery: UpdateQuery<User> = {
      $set: {},
    };
    if (data.character) {
      const character = await this.characterModel.findById(data.character);
      if (!character) throw new ApiException(`Character not found`, 404);
      updateQuery.$set.character = data.character;
    }
    if (data.fullname) updateQuery.$set.fullname = data.fullname;
    console.log({ updateQuery });
    return this.userModel.updateOne({ _id: userId }, updateQuery);
  }
  async getProfile(user: UserEntity) {
    return this.userModel.findById(user.id).populate(`character`);
  }
  async paginate(query: QueryDto) {
    const param: FilterQuery<User> = {};
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    if (query.q) {
      param.name = { $regex: query.q, $option: 'i' };
    }
    const [data, total] = await Promise.all([
      this.userModel.find(param).limit(limit).skip(skip).sort({ createdAt: 'desc' }),
      this.userModel.countDocuments(param),
    ]);
    return {
      page,
      limit,
      total,
      data,
    } as PaginateResult<UserDocument>;
  }
  async count(role: string = ROLE.USER) {
    return this.userModel.countDocuments({ role });
  }
  async countByDate(dateSequences: Date[], filter?: FilterQuery<User>) {
    return Promise.all(
      dateSequences.map(async (date) => ({
        count: await this.userModel.countDocuments({
          createdAt: { $lte: this.getEndOfDay(date) },
          ...filter,
        }),
        date,
      })),
    );
  }
  getStartOfDay(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }
  getEndOfDay(date: Date) {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }
}
