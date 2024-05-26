import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';

type Payload = {
  client: Client;
  meetingId: string;
};

export class MeetingAddUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, meetingId } = data;
    const meeting = this.room.state.meetings.get(meetingId);
    const clientId = client.sessionId;

    if (!meeting || meeting.connectedUser.has(clientId)) return;
    meeting.connectedUser.add(clientId);
    if (!meeting.isOpen) {
      meeting.isOpen = true;
    }
  }
}

export class MeetingRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, meetingId } = data;
    const meeting = this.state.meetings.get(meetingId);

    if (meeting.connectedUser.has(client.sessionId)) {
      meeting.connectedUser.delete(client.sessionId);
      if (meeting.connectedUser.size == 0 && meeting.isOpen) {
        meeting.isOpen = false;
      }
    }
  }
}
