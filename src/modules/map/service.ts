import { Inject, Injectable } from '@nestjs/common';
import { MapEntity } from './entity';
import { MapModel } from './schema';
import { MAP_MODEL } from './constant';
import mongoose from 'mongoose';

@Injectable()
export class MapService {
  constructor(@Inject(MAP_MODEL) private readonly mapModel: MapModel) {}
  async create(data: Partial<MapEntity>) {
    const map = new this.mapModel(data);
    return map.save();
  }
  async update(id: string, data: Partial<MapEntity>) {
    return this.mapModel.updateOne(data, { id: new mongoose.Types.ObjectId(id) });
  }
  async findAll() {
    return this.mapModel.find();
  }
  async findById(id: string) {
    return this.mapModel.findById(id);
  }
  async findByName(name: string) {
    return this.mapModel.findOne({ name });
  }
  async count() {
    return this.mapModel.countDocuments()
  }
}
