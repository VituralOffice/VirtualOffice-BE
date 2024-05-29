import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';

type AddMemberPayload = {
  client: Client;
  meetingId: string;
  userId: string;
  title?: string;
};

type RemoveMemberPayload = {
  client: Client;
  meetingId: string;
  userId: string;
};

// type MeetingChangeInfoPayload = {
//   client: Client;
//   meetingId: string;
//   title: string;
//   chatId: string;
// };

// export class MeetingChangeInfoCommand extends Command<IOfficeState, MeetingChangeInfoPayload> {
//   execute(data: MeetingChangeInfoPayload) {
//     const { client, meetingId, title, chatId } = data;
//     const meeting = this.room.state.meetings.get(meetingId);
//     const clientId = client.sessionId;

//     if (!meeting || meeting.connectedUser.has(clientId)) return;
//     meeting.title = title;
//     meeting.chatId = chatId;
//   }
// }

export class MeetingAddUserCommand extends Command<IOfficeState, AddMemberPayload> {
  execute(data: AddMemberPayload) {
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

export class MeetingRemoveUserCommand extends Command<IOfficeState, RemoveMemberPayload> {
  execute(data: RemoveMemberPayload) {
    const { client, meetingId } = data;
    const meeting = this.state.meetings.get(meetingId);

    if (meeting.connectedUser.has(client.sessionId)) {
      meeting.connectedUser.delete(client.sessionId);
      if (meeting.connectedUser.size == 0 && meeting.isOpen) {
        meeting.isOpen = false;
        meeting.title = '';
        meeting.chatId = '';
        console.log('End meeting ' + meetingId);
      }
    }
  }
}
