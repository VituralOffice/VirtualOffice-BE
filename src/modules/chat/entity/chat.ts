import { ApiProperty } from '@nestjs/swagger';
import { Chat } from '../schema/chat';
import { ChatMember } from '../schema/chatMember';

export class ChatEntity extends Chat {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  creator: string;
  @ApiProperty()
  room: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  members: ChatMember[];
}
