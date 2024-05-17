import { IsNotEmpty, IsString } from 'class-validator';
import { CHAT_TYPE } from './constant';

export class QueryChatDto {
  name?: string;
  @IsString()
  sort?: 'asc' | 'desc';
  sortBy?: 'createdAt' | 'lastModifiedAt';
}
export class CreateChatDto {
  name?: string;
  type: CHAT_TYPE;
  members?: string[];
}

export class AddMemberChatDto {
  @IsNotEmpty()
  @IsString()
  user: string;
}
export class ChatMessagePayload {
  user: string;
  chat: string;
  text: string;
  type: string;
  //todo: file
}
export class BatchChatMessagePayload {
  chat: string;
  limit: number;
  fromId?: string;
  fromCreatedAt?: Date;
}
