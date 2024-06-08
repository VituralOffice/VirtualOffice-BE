import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { MapService } from 'src/modules/map/service';
import { PlanService } from 'src/modules/plan/service';
import { RoomService } from 'src/modules/rooms/service';
import { SubscriptionService } from 'src/modules/subcription/service';
import { UserService } from 'src/modules/user/service';

@Injectable()
export class StatsService {
  constructor(
    private readonly mapService: MapService,
    private readonly roomService: RoomService,
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
  ) {}
  async getStats() {
    return {
      totalMap: await this.mapService.count(),
      totalUser: await this.userService.count(),
      totalPlan: await this.planService.count(),
      totalRoom: await this.roomService.count({ active: true }),
      totalSubscription: await this.subscriptionService.count({ freePlan: false }),
    };
  }
  async getUserStats() {
    return {
      totalMap: await this.mapService.count(),
      totalUser: await this.userService.count(),
      totalPlan: await this.planService.count(),
      totalRoom: await this.roomService.count({ active: true }),
      totalSubscription: await this.subscriptionService.count({ freePlan: false }),
    };
  }
  getMonthStartAndEnd(date: Date) {
    const inputDate = moment(date);
    const startDate = inputDate.startOf('month').toDate();
    const endDate = inputDate.endOf('month').toDate();
    return {
      startDate,
      endDate,
    };
  }
  generateDateSequence(startDate: Date, endDate: Date) {
    const dates = [];
    let currentDate = new Date(startDate);
    endDate = new Date(endDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }
}
