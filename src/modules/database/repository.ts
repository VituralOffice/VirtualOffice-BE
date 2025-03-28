import { HttpStatus } from '@nestjs/common';
import { ApiException } from 'src/common';
import {
  FilterQuery,
  Model,
  MongooseUpdateQueryOptions,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { Document } from 'mongoose';

import { IRepository } from './adapter';
import { CreatedModel, RemovedModel, UpdatedModel } from './types';

export class Repository<T extends Document> implements IRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async isConnected(): Promise<void> {
    if (this.model.db.readyState !== 1)
      throw new ApiException(`db ${this.model.db.name} disconnected`, HttpStatus.INTERNAL_SERVER_ERROR, 'Database');
  }

  async create(document: object): Promise<T> {
    const createdEntity = new this.model(document);
    const savedResult = await createdEntity.save();
    const result = await this.findById(savedResult.id);
    return result;
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    return await this.model.find(filter, undefined, options);
  }

  async findById(id: string | number): Promise<T> {
    return await this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T> {
    return await this.model.findOne(filter, undefined, options);
  }

  async findAll(): Promise<T[]> {
    return await this.model.find();
  }

  async remove(filter: FilterQuery<T>): Promise<RemovedModel> {
    const { deletedCount } = await this.model.deleteOne(filter);
    return { deletedCount, deleted: !!deletedCount };
  }

  async updateOne(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions,
  ): Promise<UpdatedModel> {
    return await this.model.updateOne(filter, updated, options);
  }

  async updateMany(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions,
  ): Promise<UpdatedModel> {
    return await this.model.updateMany(filter, updated, options);
  }
}
