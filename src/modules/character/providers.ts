import { Connection } from 'mongoose';
import { Character, CharacterSchema } from './schema';
import { DATABASE_CONNECTION } from '../database/constant';
import { CharacterService } from './service';
import { CHARACTER_MODEL } from './constant';

export const characterProviders = [
  {
    provide: CHARACTER_MODEL,
    useFactory: (connection: Connection) => connection.model(Character.name, CharacterSchema),
    inject: [DATABASE_CONNECTION],
  },
  CharacterService,
];
