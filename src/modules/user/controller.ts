import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UpdateProfileDto } from './dto';
import { UserService } from './service';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from './entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('users')
@Controller({
  path: 'users',
})
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  async getProfile(@User() user: UserEntity) {
    console.log({ user });
    const profile = await this.userService.getProfile(user);
    return {
      message: `Success`,
      result: profile,
    };
  }
  @ApiBody({
    type: UpdateProfileDto,
  })
  @Patch('profile')
  async updateProfile(@Body() body: UpdateProfileDto, @User() user: UserEntity) {
    const update = await this.userService.updateProfile(user.id, body);
    return {
      result: update,
      message: `Success`,
    };
  }
}
