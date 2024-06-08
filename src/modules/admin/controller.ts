import { Controller, Get, Query } from '@nestjs/common';
import { RoomService } from '../rooms/service';
import { UserService } from '../user/service';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLE } from 'src/common/enum/role';
import { QueryDto, QueryUserStatsDto } from './dto';
import { SubscriptionService } from '../subcription/service';
import { StatsService } from './services/stats';

@Controller({
  path: 'admin',
})
export class AdminController {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly statsService: StatsService,
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
  @Get('subscriptions')
  @Roles([ROLE.ADMIN])
  async getSubscriptions(@Query() query: QueryDto) {
    const result = await this.subscriptionService.paginate(query);
    return {
      result,
      message: `Success`,
    };
  }
  @Get('stats')
  @Roles([ROLE.ADMIN])
  async getStats() {
    const result = await this.statsService.getStats();
    return {
      result,
      message: `Success`,
    };
  }
  @Get('stats/user')
  @Roles([ROLE.ADMIN])
  async getUserStats(@Query() query: QueryUserStatsDto) {
    const { startDate, endDate } = this.statsService.getMonthStartAndEnd(query.startDate);
    const dateSequences = this.statsService.generateDateSequence(startDate, endDate);
    const result = await this.userService.countByDate(dateSequences, { role: ROLE.USER });
    return {
      result,
      message: `Success`,
    };
  }
}
