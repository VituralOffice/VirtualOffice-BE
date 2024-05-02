import { Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_MODEL } from './constant';
import { SubscriptionModel, SubscriptionDocument } from './schema';
@Injectable()
export class SubscriptionService {
  constructor(@Inject(SUBSCRIPTION_MODEL) private readonly subscriptionModel: SubscriptionModel) {}
  async findAll() {
    return this.subscriptionModel.find();
  }
  async findOne() {
    return this.subscriptionModel.findOne();
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
}
