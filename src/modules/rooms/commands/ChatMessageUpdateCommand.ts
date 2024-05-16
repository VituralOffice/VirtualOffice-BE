import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';
import { ChatMessage, MapMessage } from '../schema/OfficeState';

type Payload = {
  client: Client;
  content: string;
  chatId: string;
};

export default class ChatMessageUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, content, chatId } = data;
    const player = this.room.state.players.get(client.sessionId);
    const mapMessages = this.room.state.mapMessages;
    console.log({ mapMessages });
    const newMessage = new ChatMessage();
    newMessage.author = player.fullname;
    newMessage.content = content;
    if (!mapMessages.has(chatId)) {
      const mapMessage = new MapMessage();
      mapMessage.id = chatId;
      mapMessage.messages = [newMessage];
      mapMessages[chatId] = mapMessage;
    } else {
      /**
       * Only allow server to store a maximum of 100 chat messages:
       * remove the first element before pushing a new one when array length is >= 100
       */
      if (mapMessages[chatId].messages.length >= 100) mapMessages[chatId].messages.shift();
      mapMessages[chatId].messages.push(newMessage);
    }
  }
}
