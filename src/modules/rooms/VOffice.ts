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
  Chair,
} from './schema/OfficeState';
import { Message } from '../../types/Messages';
import { IMapData, IRoomData } from '../../types/Rooms';
import { whiteboardRoomIds } from './schema/OfficeState';
import PlayerUpdateCommand, { PlayerUpdateMeetingStatusCommand } from './commands/PlayerUpdateCommand';
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand';
import { WhiteboardAddUserCommand, WhiteboardRemoveUserCommand } from './commands/WhiteboardUpdateArrayCommand';
import { RoomService } from './service';
import { INestApplication, Injectable } from '@nestjs/common';
import { verifyJwt } from 'src/common/helpers/jwt';
import { ISecretsService } from '../global/secrets/adapter';
import { UserService } from '../user/service';
import { UserEntity } from '../user/entity';
import { ChatService } from '../chat/service';
import { ChatMessageDocument } from '../chat/schema/chatMessage';
import {
  MeetingAddUserCommand,
  MeetingLockCommand,
  MeetingRemoveUserCommand,
  MeetingUnLockCommand,
} from './commands/MeetingUpdateArrayCommand';
import { ChairRemoveUserCommand, ChairSetUserCommand } from './commands/ChairUpdateCommand';
import { ChatEntity } from '../chat/entity/chat';
import { ChatMember } from '../chat/schema/chatMember';
import { CHAT_TYPE } from '../chat/constant';
import { CharacterService } from '../character/service';
import { ChatDocument } from '../chat/schema/chat';

@Injectable()
export class VOffice extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this);
  private name: string;

  public static roomsMap: Map<string, VOffice> = new Map();

  constructor(
    private readonly roomService: RoomService,
    private readonly secretService: ISecretsService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly characterService: CharacterService,
  ) {
    super();
  }
  async onCreate(options: IRoomData) {
    this.name = options.name;
    this.autoDispose = false;
    this.setMetadata({ ...options });
    this.roomId = options._id;

    VOffice.roomsMap.set(this.roomId, this);

    this.setState(new OfficeState());
    const room = await this.roomService.findByIdPopulate(this.roomId, ['map']);
    const map = room.map as unknown as IMapData;
    for (let i = 0; i < map.totalMeeting; i++) {
      this.state.meetings.set(String(i), new Meeting());
    }
    for (let i = 0; i < map.totalWhiteboard; i++) {
      this.state.whiteboards.set(String(i), new Whiteboard());
    }
    for (let i = 0; i < map.totalChair; i++) {
      this.state.chairs.set(String(i), new Chair());
    }

    //#region register events
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
            title: chat.name,
          });
          client.send(Message.ADD_CHAT, {
            chat: chatDoc,
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

          client.send(Message.CONNECT_TO_MEETING, { meetingId: message.meetingId, title: chat.name });
          client.send(Message.ADD_CHAT, { chat: chat });
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

    this.onMessage(Message.MEETING_LOCK, (client, message: { meetingId: string }) => {
      this.dispatcher.dispatch(new MeetingLockCommand(), {
        client,
        meetingId: message.meetingId,
      });
    });
    this.onMessage(Message.MEETING_UNLOCK, (client, message: { meetingId: string }) => {
      this.dispatcher.dispatch(new MeetingUnLockCommand(), {
        client,
        meetingId: message.meetingId,
      });
    });

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
    this.onMessage(Message.UPDATE_PLAYER_CHARACTER_ID, async (client, message: { id: string }) => {
      const character = await this.characterService.findById(message.id);
      if (!character) return;
      const player = this.state.players.get(client.sessionId);
      player.characterId = message.id;
      player.characterAvatar = character.avatar;
    });

    // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
    this.onMessage(Message.UPDATE_PLAYER_MEETING_STATUS, (client, message: { isInMeeting: boolean }) => {
      this.dispatcher.dispatch(new PlayerUpdateMeetingStatusCommand(), {
        client,
        isInMeeting: message.isInMeeting,
      });
    });

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.READY_TO_CONNECT, (client, message: { ready: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.readyToConnect = message.ready;
    });

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.MEDIA_CONNECTED, (client, message: { connected: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.mediaConnected = message.connected;
    });

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.MEDIA_STREAM_CHANGE, (client, message: { clientId: string }) => {
      const player = this.state.players.get(message.clientId);
      if (player) player.changeMediaStream++;
    });

    // when a player disconnect a stream, broadcast the signal to the other player connected to the stream
    this.onMessage(Message.DISCONNECT_STREAM, (client, message: { clientId: string }) => {
      this.clients.forEach((cli) => {
        if (cli.sessionId === message.clientId) {
          cli.send(Message.DISCONNECT_STREAM, client.sessionId);
        }
      });
    });

    // this.onMessage(Message.LOAD_CHAT, async (client) => {
    //   const player = this.state.players.get(client.sessionId);
    //   const chats = await this.chatService.getAll(player, this.roomId, new QueryChatDto());
    //   const mapChatMessages: IMapMessage[] = [];
    //   await Promise.all(
    //     chats.map(async (c) => {
    //       // if (this.state.mapMessages.get(c.id)) mapChatMessages.push(this.state.mapMessages.get(c.id));
    //       // else {
    //       // batch load message when data not in mapMessage (room state)
    //       const chatMessages = await this.chatService.batchLoadChatMessages({
    //         chat: c.id,
    //         limit: 100,
    //       });
    //       const chatMessageSchemas = convertToChatMessageSchema(chatMessages.reverse());
    //       const mapMessage = new MapMessage();
    //       mapMessage.id = c.id;
    //       mapMessage.messages = chatMessageSchemas;
    //       // this.state.mapMessages.set(c.id, mapMessage);
    //       mapChatMessages.push(mapMessage);
    //       // }
    //     }),
    //   );
    //   client.send(Message.LOAD_CHAT, { mapChatMessages });
    // });
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
    //#endregion register events
  }

  async onAuth(client: Client, options: { token: string | null }) {
    if (!options.token) throw new ServerError(401, 'Unauthorized');
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
    await this.roomService.updateRoomMember(this.roomId, player.id, { online: true, lastJoinedAt: new Date() });
    // const room = await this.roomService.findById(this.roomId);
    // if (room.private && !room.members.find((m) => m.user.toString() === auth.id.toString())) return;
    // if (!room.private && !room.members.find((m) => m.user.toString() === auth.id.toString())) {
    //   // add user to members
    //   await this.roomService.joinRoom(room, auth);
    // }
    // await this.roomService.updateRoomMember(this.roomId, auth.id, { online: true });
    // // check user is member of this room
    // const updatedRoomData = await this.roomService.findByIdPopulate(this.roomId, [
    //   'map',
    //   {
    //     path: 'members.user',
    //     populate: {
    //       path: 'character',
    //     },
    //   },
    // ]);
    // client.send(Message.SEND_ROOM_DATA, {
    //   id: this.roomId,
    //   ...updatedRoomData.toJSON(),
    // });
  }
  static async sendRoomMessage(roomId: string, messageType: Message, payload: any) {
    const room = VOffice.roomsMap.get(roomId);
    if (!room) return;
    room.clients.forEach((client) => {
      client.send(messageType, payload);
    });
  }
  static async sendRoomMessageToClients(roomId: string, users: string[], messageType: Message, payload: any) {
    const room = VOffice.roomsMap.get(roomId);
    if (!room) return;
    users.forEach((u) => {
      const sessionId = room.state.mapClients.get(u);
      const client = room.clients.find((c) => c.sessionId == sessionId);
      if (client) {
        client.send(messageType, payload);
      }
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
        // check if admin leave, give authority to second user join
        if (client.sessionId === meeting.adminUser && meeting.connectedUser.size > 0)
          meeting.adminUser = meeting.connectedUser.values[0];
        if (meeting.connectedUser.size == 0) {
          meeting.isOpen = false;
          meeting.adminUser = '';
        }
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

    // Remove this room from the static map when the room is disposed
    VOffice.roomsMap.delete(this.roomId);
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
    m.path = cm.message.path;
    const reacts: React[] = [];
    icm.message = m;
    icm.createdAt = cm.createdAt.toString();
    icm.reacts = reacts;
    icm.user = newPlayer(cm.user as UserEntity);
    return icm;
  });
