import { Room, Client, ServerError } from 'colyseus';
import { Dispatcher } from '@colyseus/command';
import {
  Player,
  OfficeState,
  Meeting,
  Whiteboard,
  React,
  ChatMessage,
  Message as MessageSchema,
  MapMessage,
  Chair,
} from './schema/OfficeState';
import { Message } from '../../types/Messages';
import { IRoomData } from '../../types/Rooms';
import { whiteboardRoomIds } from './schema/OfficeState';
import PlayerUpdateCommand, {
  PlayerUpdateCharacterIdCommand,
  PlayerUpdateMeetingStatusCommand,
} from './commands/PlayerUpdateCommand';
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand';
import { WhiteboardAddUserCommand, WhiteboardRemoveUserCommand } from './commands/WhiteboardUpdateArrayCommand';
import ChatMessageUpdateCommand from './commands/ChatMessageUpdateCommand';
import { RoomService } from './service';
import { INestApplication, Injectable } from '@nestjs/common';
import { verifyJwt } from 'src/common/helpers/jwt';
import { ISecretsService } from '../global/secrets/adapter';
import { UserService } from '../user/service';
import { UserEntity } from '../user/entity';
import { ChatService } from '../chat/service';
import { QueryChatDto } from '../chat/dto';
import { IChatMessage, IMapMessage } from 'src/types/IOfficeState';
import { ChatMessageDocument } from '../chat/schema/chatMessage';
import { MeetingAddUserCommand, MeetingRemoveUserCommand } from './commands/MeetingUpdateArrayCommand';
import { ChairRemoveUserCommand, ChairSetUserCommand } from './commands/ChairUpdateCommand';
import { ChatEntity } from '../chat/entity/chat';
import { ChatMember } from '../chat/schema/chatMember';
import { CHAT_TYPE } from '../chat/constant';

@Injectable()
export class VOffice extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this);
  private name: string;
  constructor(
    private readonly roomService: RoomService,
    private readonly secretService: ISecretsService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {
    super();
  }
  async onCreate(options: IRoomData) {
    this.name = options.name;
    this.autoDispose = false;
    this.setMetadata({ ...options });
    this.roomId = options.id;
    this.setState(new OfficeState());
    for (let i = 0; i < 5; i++) {
      this.state.meetings.set(String(i), new Meeting());
    }
    for (let i = 0; i < 3; i++) {
      this.state.whiteboards.set(String(i), new Whiteboard());
    }
    for (let i = 0; i < 8; i++) {
      this.state.chairs.set(String(i), new Chair());
    }

    // when a player connect to a chair, add to the chair connectedUser array
    this.onMessage(Message.CONNECT_TO_CHAIR, (client, message: { chairId: string }) => {
      this.dispatcher.dispatch(new ChairSetUserCommand(), {
        client,
        chairId: message.chairId,
      });
    });

    // when a player disconnect from a chair, remove from the chair connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_CHAIR, (client, message: { chairId: string }) => {
      this.dispatcher.dispatch(new ChairRemoveUserCommand(), {
        client,
        chairId: message.chairId,
      });
    });

    // when a player connect to a meeting, add to the meeting connectedUser array
    this.onMessage(
      Message.CONNECT_TO_MEETING,
      async (client, message: { roomId: string; meetingId: string; userId: string; title?: string }) => {
        console.log('on CONNECT_TO_MEETING');
        const meeting = this.state.meetings.get(message.meetingId);
        const user = await this.userService.findById(message.userId);
        if (!user) return;

        if (meeting.connectedUser.size === 0) {
          // if no one in meeeting, create new chat
          const chat = new ChatEntity();
          const members: ChatMember[] = [];
          chat.name = message.title;
          // creator member
          const creatorMember = new ChatMember();
          creatorMember.role = 'admin';
          creatorMember.user = message.userId;
          members.push(creatorMember);
          chat.creator = message.userId;
          chat.room = message.roomId;
          chat.type = CHAT_TYPE.GROUP;
          chat.members = members;
          const chatDoc = await this.chatService.create(chat);

          // set meeting info
          meeting.chatId = chatDoc.id;
          meeting.title = chat.name;

          client.send(Message.CONNECT_TO_MEETING, {
            meetingId: message.meetingId,
            chatId: chatDoc.id,
            title: chat.name,
          });
          console.log('send new group chaat', chat.name);
        } else {
          const chatId = meeting.chatId;
          if (chatId === '') return;
          const chat = await this.chatService.findById(chatId);
          if (!chat) return;
          const member = chat.members.find((m) => m.user === message.userId);
          if (member) {
            //TODO: remove leaveAt prop
          } else {
            const newMember = new ChatMember();
            newMember.user = message.userId;
            newMember.role = `user`;
            chat.members.push(newMember);
            await chat.save();
          }
          client.send(Message.CONNECT_TO_MEETING, { meetingId: message.meetingId, chatId: chat.id, title: chat.name });
          console.log('send exists group chat', chat.name);
        }

        this.dispatcher.dispatch(new MeetingAddUserCommand(), {
          client,
          meetingId: message.meetingId,
          userId: message.userId,
          title: message.title,
        });
      },
    );

    // // when a player connect to a meeting, add to the meeting connectedUser array
    // this.onMessage(
    //   Message.MEETING_CHANGE_INFO,
    //   (client, message: { meetingId: string; title?: string; chatId?: string }) => {
    //     this.dispatcher.dispatch(new MeetingChangeInfoCommand(), {
    //       client,
    //       meetingId: message.meetingId,
    //       title: message.title,
    //       chatId: message.chatId,
    //     });
    //   },
    // );

    // when a player disconnect from a meeting, remove from the meeting connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_MEETING, (client, message: { meetingId: string; userId: string }) => {
      this.dispatcher.dispatch(new MeetingRemoveUserCommand(), {
        client,
        meetingId: message.meetingId,
        userId: message.userId,
      });
    });

    // when a player stop sharing screen
    this.onMessage(Message.STOP_SCREEN_SHARE, (client, message: { meetingId: string }) => {
      const meeting = this.state.meetings.get(message.meetingId);
      meeting.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
            cli.send(Message.STOP_SCREEN_SHARE, client.sessionId);
          }
        });
      });
    });

    // when a player stop sharing screen
    this.onMessage(Message.MEETING_STOP_CAMERA_SHARE, (client, message: { meetingId: string }) => {
      const meeting = this.state.meetings.get(message.meetingId);
      meeting.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
            cli.send(Message.MEETING_STOP_CAMERA_SHARE, client.sessionId);
          }
        });
      });
    });

    // when a player connect to a whiteboard, add to the whiteboard connectedUser array
    this.onMessage(Message.CONNECT_TO_WHITEBOARD, (client, message: { whiteboardId: string }) => {
      this.dispatcher.dispatch(new WhiteboardAddUserCommand(), {
        client,
        whiteboardId: message.whiteboardId,
      });
    });

    // when a player disconnect from a whiteboard, remove from the whiteboard connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_WHITEBOARD, (client, message: { whiteboardId: string }) => {
      this.dispatcher.dispatch(new WhiteboardRemoveUserCommand(), {
        client,
        whiteboardId: message.whiteboardId,
      });
    });

    // when receiving updatePlayer message, call the PlayerUpdateCommand
    this.onMessage(Message.UPDATE_PLAYER, (client, message: { x: number; y: number; anim: string }) => {
      this.dispatcher.dispatch(new PlayerUpdateCommand(), {
        client,
        x: message.x,
        y: message.y,
        anim: message.anim,
      });
    });

    // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
    this.onMessage(Message.UPDATE_PLAYER_NAME, (client, message: { name: string }) => {
      this.dispatcher.dispatch(new PlayerUpdateNameCommand(), {
        client,
        name: message.name,
      });
    });

    // when receiving updatePlayerName message, call the PlayerUpdateCharacterIdCommand
    this.onMessage(Message.UPDATE_PLAYER_CHARACTER_ID, (client, message: { id: number }) => {
      this.dispatcher.dispatch(new PlayerUpdateCharacterIdCommand(), {
        client,
        id: message.id,
      });
    });

    // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
    this.onMessage(Message.UPDATE_PLAYER_MEETING_STATUS, (client, message: { isInMeeting: boolean }) => {
      this.dispatcher.dispatch(new PlayerUpdateMeetingStatusCommand(), {
        client,
        isInMeeting: message.isInMeeting,
      });
    });

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.READY_TO_CONNECT, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.readyToConnect = true;
    });

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.VIDEO_CONNECTED, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.videoConnected = true;
    });

    // when a player disconnect a stream, broadcast the signal to the other player connected to the stream
    this.onMessage(Message.DISCONNECT_STREAM, (client, message: { clientId: string }) => {
      this.clients.forEach((cli) => {
        if (cli.sessionId === message.clientId) {
          cli.send(Message.DISCONNECT_STREAM, client.sessionId);
        }
      });
    });

    this.onMessage(Message.LOAD_CHAT, async (client) => {
      const player = this.state.players.get(client.sessionId);
      const chats = await this.chatService.getAll(player, this.roomId, new QueryChatDto());
      const mapChatMessages: IMapMessage[] = [];
      await Promise.all(
        chats.map(async (c) => {
          // if (this.state.mapMessages.get(c.id)) mapChatMessages.push(this.state.mapMessages.get(c.id));
          // else {
          // batch load message when data not in mapMessage (room state)
          const chatMessages = await this.chatService.batchLoadChatMessages({
            chat: c.id,
            limit: 100,
          });
          const chatMessageSchemas = convertToChatMessageSchema(chatMessages.reverse());
          const mapMessage = new MapMessage();
          mapMessage.id = c.id;
          mapMessage.messages = chatMessageSchemas;
          // this.state.mapMessages.set(c.id, mapMessage);
          mapChatMessages.push(mapMessage);
          // }
        }),
      );
      client.send(Message.LOAD_CHAT, { mapChatMessages });
    });
    // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
    this.onMessage(
      Message.ADD_CHAT_MESSAGE,
      async (client, message: { content: string; chatId: string; type: string; path: string; filename: string }) => {
        if (!message) return;
        // update the message array (so that players join later can also see the message)
        const chat = await this.chatService.findById(message.chatId);
        if (!chat) return;
        const player = this.state.players.get(client.sessionId);
        let chatMessage = this.chatService.buildChatMessage({
          chat: chat.id,
          text: message.content,
          type: message.type || 'text',
          path: message.path,
          user: player.id,
          filename: message.filename,
        });
        chatMessage = await this.chatService.addChatMessage(chatMessage);
        chatMessage.user = player;
        // this.dispatcher.dispatch(new ChatMessageUpdateCommand(), {
        //   client,
        //   message: chatMessage,
        // });
        // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
        chat.members.forEach((m) => {
          this.clients
            .find((c) => c.sessionId === this.state.mapClients[m.user])
            ?.send(Message.ADD_CHAT_MESSAGE, {
              chatId: chat.id,
              message: chatMessage,
            });
        });
      },
    );
  }

  async onAuth(client: Client, options: { token: string | null }) {
    if (!options.token) throw new ServerError(403, 'Forbidden, must be authenticateed');
    const payload = verifyJwt(options.token, this.secretService.jwt.accessSecret);
    if (!payload) throw new ServerError(401, 'Unauthorized');
    const user = await this.userService.findById(payload.userId);
    if (!user) throw new ServerError(401, 'Unauthorized');
    const userProfile = await this.userService.getProfile(user);
    return userProfile;
  }
  async onJoin(client: Client, options: any, auth: UserEntity) {
    const player = newPlayer(auth);
    this.state.players.set(client.sessionId, player);
    this.state.mapClients.set(player.id, client.sessionId);
    await this.roomService.updateRoomMember(this.roomId, auth.id, { online: true });
    const room = await this.roomService.findById(this.roomId);
    await room.populate(['map', 'members.user']);
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      ...room.toJSON(),
    });
  }

  async onLeave(client: Client, consented: boolean) {
    if (this.state.players.has(client.sessionId)) {
      const player = this.state.players[client.sessionId];
      this.state.players.delete(client.sessionId);
      this.state.mapClients.delete(player.id);
      this.roomService.updateRoomMember(this.roomId, player.id, { online: false });
    }

    this.state.chairs.forEach((chair) => {
      if (chair.connectedUser == client.sessionId) {
        chair.connectedUser = '';
      }
    });

    this.state.meetings.forEach((meeting) => {
      if (meeting.connectedUser.has(client.sessionId)) {
        meeting.connectedUser.delete(client.sessionId);
      }
    });
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboard.connectedUser.has(client.sessionId)) {
        whiteboard.connectedUser.delete(client.sessionId);
      }
    });
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboardRoomIds.has(whiteboard.roomId)) whiteboardRoomIds.delete(whiteboard.roomId);
    });

    console.log('room', this.roomId, 'disposing...');
    this.dispatcher.stop();
  }
}

/**
 *
 * @description inject dependencies to any class not initialized by nestjs
 */
export function injectDeps<T extends { new(...args: any[]): Room }>(app: INestApplication, target: T): T {
  const selfDeps = Reflect.getMetadata('self:paramtypes', target) || [];
  const dependencies = Reflect.getMetadata('design:paramtypes', target) || [];

  selfDeps.forEach((dep: any) => {
    dependencies[dep.index] = dep.param;
  });

  const injectables =
    dependencies.map((dependency: any) => {
      return app.get(dependency);
    }) || [];

  return class extends target {
    constructor(...args: any[]) {
      super(...injectables);
    }
  };
}
export const newPlayer = (user: UserEntity): Player => {
  const player = new Player();
  player.id = user.id;
  player.email = user.email;
  player.password = '';
  player.avatar = user.avatar || '';
  player.role = user.role;
  player.online = true;
  player.provider = user.provider;
  player.providerId = user.providerId;
  player.isVerified = user.isVerified;
  player.character = (user as any).character;
  player.fullname = user.fullname;
  player.playerName = user.fullname;
  return player;
};
export const convertToChatMessageSchema = (chatMessages: ChatMessageDocument[]) =>
  chatMessages.map((cm) => {
    const icm = new ChatMessage();
    icm.chat = cm.chat;
    const m = new MessageSchema();
    m.text = cm.message.text;
    m.type = cm.message.type;
    const reacts: React[] = [];
    icm.message = m;
    icm.createdAt = cm.createdAt.toString();
    icm.reacts = reacts;
    icm.user = newPlayer(cm.user as UserEntity);
    return icm;
  });
