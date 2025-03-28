import { Inject, Injectable } from '@nestjs/common';
import { PAYMENT_STATUS, SUBSCRIPTION_MODEL, SUBSCRIPTION_STATUS } from './constant';
import { SubscriptionModel, SubscriptionDocument, Subscription } from './schema';
import { QuerySubscriptionDto } from './dto';
import { FilterQuery } from 'mongoose';
import { UserEntity } from '../user/entity';
import { PlanEntity } from '../plan/entity';
import { QueryDto } from '../admin/dto';
import { PaginateResult } from 'src/common/paginate/pagnate';
@Injectable()
export class SubscriptionService {
  constructor(@Inject(SUBSCRIPTION_MODEL) private readonly subscriptionModel: SubscriptionModel) {}
  async findAll() {
    return this.subscriptionModel.find();
  }
  async paginate(query: QueryDto) {
    const param: FilterQuery<Subscription> = {};
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    if (query.q) {
      // todo:
    }
    const [data, total] = await Promise.all([
      this.subscriptionModel
        .find(param)
        .populate([
          {
            path: 'plan',
            select: `name`,
          },
          {
            path: 'user',
            select: `fullname`,
          },
        ])
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: 'desc' }),
      this.subscriptionModel.countDocuments(param),
    ]);
    return {
      page,
      limit,
      total,
      data,
    } as PaginateResult<Subscription>;
  }
  async findAllBelongToUser(user: UserEntity, query: QuerySubscriptionDto) {
    const param: FilterQuery<Subscription> = {
      user: user.id,
    };
    if (query.status) param.status = { $in: query.status.split(',') };
    if (query.freePlan !== undefined) param.freePlan = query.freePlan;
    return this.subscriptionModel.find(param).populate('plan');
  }
  async findHighestMonthlyPriceSubscription(user: UserEntity) {
    return this.subscriptionModel
      .findOne({
        status: SUBSCRIPTION_STATUS.ACTIVE,
        user: user.id,
        freePlan: { $in: [false, true] },
      })
      .populate('plan')
      .sort({ freePlan: 1 });
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
  async findBySessionId(sessionId: string) {
    return this.subscriptionModel.findOne({ stripeSessionId: sessionId });
  }
  async findBySubscriptionId(subscriptionId: string) {
    return this.subscriptionModel.findOne({ stripeSubscriptionId: subscriptionId });
  }
  async create(doc: Partial<SubscriptionDocument>) {
    const subscription = new this.subscriptionModel(doc);
    return subscription.save();
  }
  async findActiveSubscription(user: UserEntity) {
    return this.subscriptionModel
      .findOne({
        status: SUBSCRIPTION_STATUS.ACTIVE,
        user: user.id,
        freePlan: { $in: [false, true] },
      })
      .sort({ freePlan: 1 });
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
  async findUserSubscription(subscriptionId: string, user: UserEntity) {
    return this.subscriptionModel.findOne({
      user: user.id,
      _id: subscriptionId,
    });
  }
  async count(filter: FilterQuery<Subscription>) {
    return this.subscriptionModel.countDocuments(filter);
  }
}
