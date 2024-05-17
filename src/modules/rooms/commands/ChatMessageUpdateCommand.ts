import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';
import { MapMessage, ChatMessage, Message, React, Player } from '../schema/OfficeState';
import { ChatMessage as DBChatMessage } from 'src/modules/chat/schema/chatMessage';

type Payload = {
  client: Client;
  message: DBChatMessage;
};

export default class ChatMessageUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, message } = data;
    console.log({ message });
    const player = this.room.state.players.get(client.sessionId);
    const chatId = message.chat;
    const chatMessage = new ChatMessage();
    chatMessage.chat = message.chat;
    const m = new Message();
    m.text = message.message.text;
    m.type = message.message.type;
    const reacts: React[] = [];
    chatMessage.message = m;
    chatMessage.createdAt = message.createdAt.toString();
    chatMessage.reacts = reacts;
    chatMessage.user = player;
    if (!this.room.state.mapMessages.has(chatId)) {
      const map = new MapMessage();
      map.id = chatId;
      map.messages = [chatMessage];
      this.room.state.mapMessages[chatId] = map;
    } else {
      /**
       * Only allow server to store a maximum of 100 chat messages:
       * remove the first element before pushing a new one when array length is >= 100
       */
      if (this.room.state.mapMessages[chatId].messages.length >= 100)
        this.room.state.mapMessages[chatId].messages.shift();
      this.room.state.mapMessages[chatId].messages.push(chatMessage);
    }
  }
}
