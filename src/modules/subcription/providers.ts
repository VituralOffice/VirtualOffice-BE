import { Connection } from 'mongoose';
import { SubscriptionSchema, Subscription } from './schema';
import { SUBSCRIPTION_MODEL } from './constant';
import { SubscriptionService } from './service';
import { DATABASE_CONNECTION } from '../database/constant';

export const subscriptionProviders = [
  {
    provide: SUBSCRIPTION_MODEL,
    useFactory: (connection: Connection) => connection.model(Subscription.name, SubscriptionSchema),
    inject: [DATABASE_CONNECTION],
  },
  SubscriptionService,
];
