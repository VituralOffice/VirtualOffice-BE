import { Controller, Get, Query } from '@nestjs/common';
import { RoomService } from '../rooms/service';
import { MapService } from '../map/service';
import { UserService } from '../user/service';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLE } from 'src/common/enum/role';
import { QueryDto } from './dto';

@Controller({
  path: 'admin',
})
export class AdminController {
  constructor(
    private readonly roomService: RoomService,
    private readonly mapService: MapService,
    private readonly userService: UserService,
  ) {}
  @Get('rooms')
  @Roles([ROLE.ADMIN])
  async getRooms(@Query() query: QueryDto) {
    const result = await this.roomService.paginate(query);
    return {
      result,
      message: `Success`,
    };
  }
  @Get('users')
  @Roles([ROLE.ADMIN])
  async getUsers(@Query() query: QueryDto) {
    const result = await this.userService.paginate(query);
    return {
      result,
      message: `Success`,
    };
  }
}
