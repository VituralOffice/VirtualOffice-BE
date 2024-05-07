import { Connection } from 'mongoose';
import { Chat, ChatSchema } from './schema/chat';
import { ChatMessage, ChatMessageSchema } from './schema/chatMessage';
import { CHAT_MESSAGE_MODEL, CHAT_MODEL } from './constant';
import { DATABASE_CONNECTION } from '../database/constant';
import { ChatService } from './service';

export const chatProviders = [
  {
    provide: CHAT_MODEL,
    useFactory: (connection: Connection) => connection.model(Chat.name, ChatSchema),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: CHAT_MESSAGE_MODEL,
    useFactory: (connection: Connection) => connection.model(ChatMessage.name, ChatMessageSchema),
    inject: [DATABASE_CONNECTION],
  },
  ChatService,
];
