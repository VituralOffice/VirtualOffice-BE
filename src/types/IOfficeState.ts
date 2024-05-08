import { Schema, ArraySchema, SetSchema, MapSchema } from '@colyseus/schema';
import { UserEntity } from 'src/modules/user/entity';

export interface IPlayer extends UserEntity, Schema {
  playerName: string;
  x: number;
  y: number;
  anim: string;
  readyToConnect: boolean;
  videoConnected: boolean;
}

export interface IComputer extends Schema {
  connectedUser: SetSchema<string>;
}

export interface IWhiteboard extends Schema {
  roomId: string;
  connectedUser: SetSchema<string>;
}

export interface IChatMessage extends Schema {
  author: string;
  createdAt: number;
  content: string;
}

export interface IOfficeState extends Schema {
  players: MapSchema<IPlayer>;
  computers: MapSchema<IComputer>;
  whiteboards: MapSchema<IWhiteboard>;
  chatMessages: ArraySchema<IChatMessage>;
}
