import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiException } from 'src/common';
import { ChatService } from 'src/modules/chat/service';

@Injectable()
export class NotFoundChatGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const chatId = request.params.chatId; // Assuming roomId is a route parameter
    try {
      const chat = await this.chatService.findById(chatId);
      if (!chat) {
        throw new ApiException(`chat not found`, 404); // Chat not found, guard fails
      }
      request.chat = chat;
      return true;
    } catch (error) {
      throw new ApiException(`chat not found`, 404); // Chat not found, guard fails
    }
  }
}
