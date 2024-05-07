import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoomService } from '../service';
import { ApiException } from 'src/common';
import mongoose, { Error } from 'mongoose';

@Injectable()
export class NotFoundRoomGuard implements CanActivate {
  constructor(private readonly roomService: RoomService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const roomId = params.roomId;
    try {
      const room = await this.roomService.findById(new mongoose.Types.ObjectId(roomId));
      if (!room) {
        throw new ApiException(`room not found`, 404); // Room not found, guard fails
      }
      request.room = room;
      return true;
    } catch (error) {
      throw new ApiException(`room not found`, 404); // Room not found, guard fails
    }
  }
}
