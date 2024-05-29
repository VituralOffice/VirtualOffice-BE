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
    if (meeting.isLocked) return;
    //admin is first user join meeting
    if (meeting.connectedUser.size === 0) meeting.adminUser = clientId;
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
      // give authority to second user joined to meeting
      if (client.sessionId === meeting.adminUser && meeting.connectedUser.size > 0)
        meeting.adminUser = [...meeting.connectedUser.values()][0];
      if (meeting.connectedUser.size == 0 && meeting.isOpen) {
        meeting.isOpen = false;
        meeting.isLocked = false;
        meeting.adminUser = ``;
      }
    }
  }
}

export class MeetingLockCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, meetingId } = data;
    const meeting = this.state.meetings.get(meetingId);
    if (client.sessionId !== meeting.adminUser) return;
    meeting.isLocked = true;
  }
}
export class MeetingUnLockCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, meetingId } = data;
    const meeting = this.state.meetings.get(meetingId);
    if (client.sessionId !== meeting.adminUser) return;
    meeting.isLocked = false;
  }
}
