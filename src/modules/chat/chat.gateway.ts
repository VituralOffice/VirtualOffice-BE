import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8888)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;
  afterInit() {
    this.logger.debug(`Socket Server Init Complete`);
  }
  handleConnection(client: Socket) {
    this.logger.log(`[GATEWAY] client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.debug(`${client.id} is disconnected...`);
  }
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { name: string; text: string }): void {
    this.server.emit('message', payload);
  }
}
