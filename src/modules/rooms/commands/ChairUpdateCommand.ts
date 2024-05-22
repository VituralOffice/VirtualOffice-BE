import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';

type Payload = {
  client: Client;
  chairId: string;
};

export class ChairSetUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, chairId } = data;
    const chair = this.room.state.chairs.get(chairId);
    const clientId = client.sessionId;

    if (!chair || chair.connectedUser) return;
    chair.connectedUser = clientId;
  }
}

export class ChairRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, chairId } = data;
    const chair = this.state.chairs.get(chairId);

    chair.connectedUser = '';
  }
}
