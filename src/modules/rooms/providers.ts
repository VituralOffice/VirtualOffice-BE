import { Connection } from 'mongoose';
import { RoomSchema, Room } from './schema';
import { ROOM_MODEL } from './constant';
import { RoomService } from './service';
import { DATABASE_CONNECTION } from '../database/constant';

export const roomProviders = [
  {
    provide: ROOM_MODEL,
    useFactory: (connection: Connection) => connection.model(Room.name, RoomSchema),
    inject: [DATABASE_CONNECTION],
  },
  RoomService,
];
