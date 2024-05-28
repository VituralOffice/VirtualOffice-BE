import { Inject, Injectable } from '@nestjs/common';
import { PLAN_MODEL } from './constant';
import { Plan, PlanModel } from './schema';
import { CreatePlanDto } from './dto';
import { FilterQuery } from 'mongoose';
import { PlanEntity } from './entity';

@Injectable()
export class PlanService {
  constructor(@Inject(PLAN_MODEL) private readonly planModel: PlanModel) {}
  async findAll() {
    return this.planModel.find();
  }
  async create(body: CreatePlanDto) {
    return this.planModel.create(body);
  }
  async findByName(name: string) {
    return this.planModel.findOne({ name });
  }
  async findById(id: string) {
    return this.planModel.findById(id);
  }
  async findOne(filter: FilterQuery<Plan>): Promise<PlanEntity> {
    return this.planModel.findOne(filter);
  }
}
