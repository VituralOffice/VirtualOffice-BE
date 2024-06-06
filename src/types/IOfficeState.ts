import { Schema, ArraySchema, SetSchema, MapSchema } from '@colyseus/schema';
import { UserEntity } from 'src/modules/user/entity';
import { User } from 'src/modules/user/schema';
import { Message } from 'src/modules/chat/schema/message';
import { React } from 'src/modules/chat/schema/react';

export interface IPlayer extends UserEntity, Schema {
  playerName: string;
  x: number;
  y: number;
  anim: string;
  readyToConnect: boolean;
  videoConnected: boolean;
  isInMeeting: boolean;
  characterId: string;
  characterAvatar: string;
}

export interface IMeeting extends Schema {
  connectedUser: SetSchema<string>;
  isOpen: boolean;
  title: string;
  chatId: string;
  adminUser: string;
  isLocked: boolean;
}

export interface IChair extends Schema {
  connectedUser: string;
}

export interface IWhiteboard extends Schema {
  roomId: string;
  connectedUser: SetSchema<string>;
}

export interface IChatMessage extends Schema {
  user: IPlayer;
  message: Message;
  reacts: React[];
}
export interface IMapMessage extends Schema {
  _id: string;
  messages: IChatMessage[];
}
export interface IOfficeState extends Schema {
  players: MapSchema<IPlayer>;
  meetings: MapSchema<IMeeting>;
  chairs: MapSchema<IChair>;
  whiteboards: MapSchema<IWhiteboard>;
  // mapMessages: MapSchema<IMapMessage>;
}
