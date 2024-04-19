import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";
import { PlanService } from "./service";
import { Roles } from "src/common/decorators/role.decorator";
import { ROLE } from "src/common/enum/role";
import { CreatePlanDto } from "./dto";
import { ApiException } from "src/common";

@ApiTags("plans")
@Controller({
  path: `plans`
})
export class PlanController {
  constructor(private readonly planService: PlanService) {}
  @Public()
  @Get()
  async getPlans() {
    const plans = await this.planService.findAll()
    return {
      result: plans,
      message: `Success`
    }
  }
  @Roles([ROLE.ADMIN])
  @Post()
  async createPlan(@Body() body: CreatePlanDto) {
    const existName = await this.planService.findByName(body.name)
    if (existName) throw new ApiException(`plan name exist`)
    const plan = await this.planService.create(body)
    return {
      result: plan,
      message: `Success`
    }
  }
}