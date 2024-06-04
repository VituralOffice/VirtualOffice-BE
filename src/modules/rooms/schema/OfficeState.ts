import { Schema, ArraySchema, SetSchema, MapSchema, type } from '@colyseus/schema';
import {
  IPlayer,
  IOfficeState,
  IMeeting,
  IWhiteboard,
  IChatMessage,
  IMapMessage,
  IChair,
} from '../../../types/IOfficeState';
import { CharacterEntity } from 'src/modules/character/entity';

export class Player extends Schema implements IPlayer {
  providerId: string;
  character: CharacterEntity;
  @type('string') id = '';
  @type('string') email = '';
  @type('string') password = '';
  @type('string') avatar = '';
  @type('string') role = '';
  @type('boolean') online = true;
  @type('string') provider = '';
  @type('boolean') isVerified = true;
  @type('string') fullname = '';
  @type('string') playerName = '';
  @type('number') x = 705;
  @type('number') y = 500;
  @type('string') anim = 'adam_idle_down';
  @type('boolean') readyToConnect = false;
  @type('boolean') videoConnected = false;
  @type('boolean') isInMeeting = false;
  @type('string') characterId = '';
  @type('string') characterAvatar = '';
}

export class Meeting extends Schema implements IMeeting {
  @type({ set: 'string' }) connectedUser = new SetSchema<string>();
  @type('boolean') isOpen = false;
  @type('string') title = '';
  @type('string') chatId = '';
  @type('boolean') isLocked = false;
  @type('string') adminUser = '';
}

export class Chair extends Schema implements IChair {
  @type('string') connectedUser = '';
}

export class Whiteboard extends Schema implements IWhiteboard {
  @type('string') roomId = getRoomId();
  @type({ set: 'string' }) connectedUser = new SetSchema<string>();
}
export class Message extends Schema {
  @type('string') type = '';
  @type('string') text = '';
  @type('string') fileName = '';
  @type('string') fileType = '';
  @type('string') path = '';
  @type('string') createdAt = '';
}
export class React extends Schema {
  @type('string') user = '';
  @type('string') type = '';
  @type('string') icon = '';
}
export class ChatMessage extends Schema implements IChatMessage {
  @type(Player)
  user;
  @type(Message)
  message;
  @type([React])
  reacts;
  @type('string')
  chat = '';
  @type('string')
  createdAt = '';
}
export class MapMessage extends Schema implements IMapMessage {
  @type('string') _id = '';
  @type([ChatMessage]) messages = [];
}
export class OfficeState extends Schema implements IOfficeState {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type({ map: Meeting })
  meetings = new MapSchema<Meeting>();

  @type({ map: Chair })
  chairs = new MapSchema<Chair>();

  @type({ map: Whiteboard })
  whiteboards = new MapSchema<Whiteboard>();

  // @type({ map: MapMessage })
  // mapMessages = new MapSchema<MapMessage>();
  @type({ map: 'string' })
  mapClients = new MapSchema<string>();
}

export const whiteboardRoomIds = new Set<string>();
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;

function getRoomId(): string {
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (!whiteboardRoomIds.has(result)) {
    whiteboardRoomIds.add(result);
    return result;
  } else {
    console.log('roomId exists, remaking another one.');
    return getRoomId();
  }
}
