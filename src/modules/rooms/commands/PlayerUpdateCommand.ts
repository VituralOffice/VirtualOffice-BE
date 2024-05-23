import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';

type UpdatePayload = {
  client: Client;
  x: number;
  y: number;
  anim: string;
};

export default class PlayerUpdateCommand extends Command<IOfficeState, UpdatePayload> {
  execute(data: UpdatePayload) {
    const { client, x, y, anim } = data;

    const player = this.room.state.players.get(client.sessionId);

    if (!player) return;
    player.x = x;
    player.y = y;
    player.anim = anim;
  }
}

type UpdateMeetingStatusPayload = {
  client: Client;
  isInMeeting: boolean;
};

export class PlayerUpdateMeetingStatusCommand extends Command<IOfficeState, UpdateMeetingStatusPayload> {
  execute(data: UpdateMeetingStatusPayload) {
    const { client, isInMeeting } = data;

    const player = this.room.state.players.get(client.sessionId);

    if (!player) return;
    player.isInMeeting = isInMeeting;
  }
}
