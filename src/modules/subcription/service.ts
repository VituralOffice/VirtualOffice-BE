import { Inject, Injectable } from '@nestjs/common';
import { PAYMENT_STATUS, SUBSCRIPTION_MODEL, SUBSCRIPTION_STATUS } from './constant';
import { SubscriptionModel, SubscriptionDocument, Subscription } from './schema';
import { QuerySubscriptionDto } from './dto';
import { FilterQuery } from 'mongoose';
import { UserEntity } from '../user/entity';
import { PlanEntity } from '../plan/entity';
@Injectable()
export class SubscriptionService {
  constructor(@Inject(SUBSCRIPTION_MODEL) private readonly subscriptionModel: SubscriptionModel) {}
  async findAll() {
    return this.subscriptionModel.find();
  }
  async findAllBelongToUser(user: UserEntity, query: QuerySubscriptionDto) {
    const param: FilterQuery<Subscription> = {
      user: user.id,
    };
    if (query.status) param.status = query.status;
    return this.subscriptionModel.find(param).populate('plan');
  }
  async findActivePlan(planId: string) {
    return this.subscriptionModel.findOne({
      status: SUBSCRIPTION_STATUS.ACTIVE,
      paymentStatus: PAYMENT_STATUS.PAID,
      plan: planId,
    });
  }
  async findByName(name: string) {
    return this.subscriptionModel.findOne({ name });
  }
  async findById(id: string) {
    return this.subscriptionModel.findById(id);
  }
  async create(doc: Partial<SubscriptionDocument>) {
    const subscription = new this.subscriptionModel(doc);
    return subscription.save();
  }
  async findActiveSubscription(user: UserEntity) {
    return this.subscriptionModel.findOne({
      status: SUBSCRIPTION_STATUS.ACTIVE,
      user: user.id,
    });
  }
  async subscribeFreePlan(user: UserEntity, plan: PlanEntity) {
    const doc = new Subscription();
    doc.freePlan = true;
    doc.total = 0;
    doc.plan = plan.id;
    doc.status = SUBSCRIPTION_STATUS.ACTIVE;
    doc.user = user.id;
    const subscription = new this.subscriptionModel(doc);
    return subscription.save();
  }
}
