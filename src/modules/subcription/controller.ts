import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './service';
import { CreatePlanDto, QuerySubscriptionDto } from './dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';

@ApiTags('subscriptions')
@Controller({
  path: `subscriptions`,
})
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get()
  async getAll(@User() user: UserEntity, @Query() query: QuerySubscriptionDto) {
    const subscriptions = await this.subscriptionService.findAllBelongToUser(user, query);
    return {
      result: subscriptions,
      message: `Success`,
    };
  }
}
