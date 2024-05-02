import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { SubscriptionService } from './service';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLE } from 'src/common/enum/role';
import { CreatePlanDto } from './dto';
import { ApiException } from 'src/common';

@ApiTags('subscriptions')
@Controller({
  path: `subscriptions`,
})
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
}
