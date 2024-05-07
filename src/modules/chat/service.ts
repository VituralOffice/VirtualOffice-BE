import { Inject, Injectable } from '@nestjs/common';
import { CHAT_MODEL } from './constant';
import { Chat, ChatDocument, ChatModel } from './schema/chat';
import { UserEntity } from '../user/entity';
import { FilterQuery } from 'mongoose';
import { QueryChatDto } from './dto';
import { ChatMember } from './schema/chatMember';
import { ChatEntity } from './entity/chat';

@Injectable()
export class ChatService {
  constructor(@Inject(CHAT_MODEL) private chatModel: ChatModel) {}
  async findById(id: string) {
    return this.chatModel.findById(id);
  }
  async getAll(user: UserEntity, roomId: string, query: QueryChatDto) {
    console.log({ query });
    const param: FilterQuery<Chat> = { members: { $elemMatch: { user: user.id } }, room: roomId };
    if (query.name)
      param.name = {
        $regex: query.name,
        $option: 'i',
      };
    return this.chatModel
      .find(param)
      .populate('members.user')
      .sort({
        lastModifiedAt: query.sort || 'desc',
      });
  }
  async create(chat: Partial<ChatDocument>) {
    return this.chatModel.create(chat);
  }
  async addMember(chat: ChatDocument, member: UserEntity) {
    const newMember = new ChatMember();
    newMember.user = member.id;
    newMember.role = `user`;
    chat.members.push(newMember);
    await chat.save();
  }
  async deleteMember(chat: ChatDocument, member: UserEntity) {
    await chat.updateOne({
      $pull: {
        members: { user: member.id },
      },
    });
  }
  async findByName(name: string, roomId: string) {
    return this.chatModel.findOne({ name, room: roomId });
  }
  async checkUserInChat(user: UserEntity, chat: ChatEntity) {
    const inChat = await this.chatModel.findOne({ members: { $elemMatch: { user: user.id } }, _id: chat.id });
    return !!inChat;
  }
}
