import { Connection } from 'mongoose';
import { MapSchema, Map } from './schema';
import { MAP_MODEL } from './constant';
import { MapService } from './service';
import { DATABASE_CONNECTION } from '../database/constant';

export const mapProviders = [
  {
    provide: MAP_MODEL,
    useFactory: (connection: Connection) => connection.model(Map.name, MapSchema),
    inject: [DATABASE_CONNECTION],
  },
  MapService,
];
