import { Connection } from 'mongoose';
import { PlanSchema, Plan } from './schema';
import { PlanService } from './service';
import { DATABASE_CONNECTION } from '../database/constant';
import { PLAN_MODEL } from './constant';

export const planProviders = [
  {
    provide: PLAN_MODEL,
    useFactory: (connection: Connection) => connection.model(Plan.name, PlanSchema),
    inject: [DATABASE_CONNECTION],
  },
  PlanService,
];
