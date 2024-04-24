import { Room, Client, ServerError } from 'colyseus';
import { Dispatcher } from '@colyseus/command';
import { Player, OfficeState, Computer, Whiteboard } from './schema/OfficeState';
import { Message } from '../../types/Messages';
import { IRoomData } from '../../types/Rooms';
import { whiteboardRoomIds } from './schema/OfficeState';
import PlayerUpdateCommand from './commands/PlayerUpdateCommand';
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand';
import { ComputerAddUserCommand, ComputerRemoveUserCommand } from './commands/ComputerUpdateArrayCommand';
import { WhiteboardAddUserCommand, WhiteboardRemoveUserCommand } from './commands/WhiteboardUpdateArrayCommand';
import ChatMessageUpdateCommand from './commands/ChatMessageUpdateCommand';
import { RoomService } from './service';
import { INestApplication, Injectable } from '@nestjs/common';
import { verifyJwt } from 'src/common/helpers/jwt';
import { ISecretsService } from '../global/secrets/adapter';
import { UserService } from '../user/service';
import { UserEntity } from '../user/entity';
@Injectable()
export class VOffice extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this);
  private name: string;
  constructor(
    private readonly roomService: RoomService,
    private readonly secretService: ISecretsService,
    private readonly userService: UserService,
  ) {
    super();
  }
  async onCreate(options: IRoomData) {
    this.name = options.name;
    this.autoDispose = options.autoDispose;
    this.setMetadata({ ...options });
    this.roomId = options.id;
    this.setState(new OfficeState());
    for (let i = 0; i < 5; i++) {
      this.state.computers.set(String(i), new Computer());
    }
    for (let i = 0; i < 3; i++) {
      this.state.whiteboards.set(String(i), new Whiteboard());
    }
    // when a player connect to a computer, add to the computer connectedUser array
    this.onMessage(Message.CONNECT_TO_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerAddUserCommand(), {
        client,
        computerId: message.computerId,
      });
    });

    // when a player disconnect from a computer, remove from the computer connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerRemoveUserCommand(), {
        client,
        computerId: message.computerId,
      });
    });

    // when a player stop sharing screen
    this.onMessage(Message.STOP_SCREEN_SHARE, (client, message: { computerId: string }) => {
      const computer = this.state.computers.get(message.computerId);
      computer.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
            cli.send(Message.STOP_SCREEN_SHARE, client.sessionId);
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

    // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
    this.onMessage(Message.ADD_CHAT_MESSAGE, (client, message: { content: string }) => {
      // update the message array (so that players join later can also see the message)
      this.dispatcher.dispatch(new ChatMessageUpdateCommand(), {
        client,
        content: message.content,
      });
      // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
      this.broadcast(
        Message.ADD_CHAT_MESSAGE,
        { clientId: client.sessionId, content: message.content },
        { except: client },
      );
    });
  }

  async onAuth(client: Client, options: { token: string | null }) {
    if (!options.token) throw new ServerError(403, 'Forbidden, must be authenticated');
    const payload = verifyJwt(options.token, this.secretService.jwt.accessSecret);
    if (!payload) throw new ServerError(401, 'Unauthorized');
    const user = await this.userService.findById(payload.userId);
    if (!user) throw new ServerError(401, 'Unauthorized');
    return user;
  }
  async onJoin(client: Client, options: any, auth: UserEntity) {
    this.state.players.set(client.sessionId, newPlayer(auth));
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
    });
  }

  onLeave(client: Client, consented: boolean) {
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
    this.state.computers.forEach((computer) => {
      if (computer.connectedUser.has(client.sessionId)) {
        computer.connectedUser.delete(client.sessionId);
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
export function injectDeps<T extends { new (...args: any[]): Room }>(app: INestApplication, target: T): T {
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
  player.avatar = user.avatar;
  player.role = user.role;
  player.online = true;
  player.provider = user.provider;
  player.providerId = user.providerId;
  player.isVerified = user.isVerified;
  player.character = user.character;
  player.fullname = user.fullname;
  return player;
};
