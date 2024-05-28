import { Inject, Injectable } from '@nestjs/common';
import { CHAT_MESSAGE_MODEL, CHAT_MODEL, CHAT_TYPE } from './constant';
import { Chat, ChatDocument, ChatModel } from './schema/chat';
import { UserEntity } from '../user/entity';
import { FilterQuery } from 'mongoose';
import { BatchChatMessagePayload, ChatMessagePayload, QueryChatDto } from './dto';
import { ChatMember } from './schema/chatMember';
import { ChatEntity } from './entity/chat';
import { ChatMessage, ChatMessageDocument, ChatMessageModel } from './schema/chatMessage';
import { Message } from './schema/message';
import { RoomEntity } from '../rooms/entity/room';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_MODEL) private chatModel: ChatModel,
    @Inject(CHAT_MESSAGE_MODEL) private chatMessageModel: ChatMessageModel,
  ) {}
  async findById(id: string) {
    return this.chatModel.findById(id);
  }
  async getAll(user: UserEntity, roomId: string, query: QueryChatDto) {
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
  async getOne(user: UserEntity, roomId: string, chatId: string) {
    const param: FilterQuery<Chat> = { _id: chatId, members: { $elemMatch: { user: user.id } }, room: roomId };

    return this.chatModel.find(param).populate('members.user');
  }
  async create(chat: Partial<ChatDocument>) {
    return this.chatModel.create(chat);
  }
  async createLobbyChat(room: RoomEntity, user: UserEntity) {
    const members: ChatMember[] = [];
    const chat = new Chat();
    const creatorMember = new ChatMember();
    creatorMember.role = 'admin';
    creatorMember.user = user.id;
    members.push(creatorMember);
    chat.creator = user.id;
    chat.room = room.id;
    chat.name = `Lobby`;
    chat.type = CHAT_TYPE.PUBLIC;
    chat.members = members;
    return this.chatModel.create(chat);
  }
  async addMember(chat: ChatDocument, member: UserEntity) {
    const newMember = new ChatMember();
    newMember.user = member.id;
    newMember.role = `user`;
    chat.members.push(newMember);
    await chat.save();
  }
  async addMemberToPublicChat(room: RoomEntity, user: UserEntity) {
    const creatorMember = new ChatMember();
    creatorMember.role = 'user';
    creatorMember.user = user.id;
    await this.chatModel.updateMany(
      {
        room: room.id,
        type: CHAT_TYPE.PUBLIC,
      },
      {
        $addToSet: {
          members: creatorMember,
        },
      },
    );
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
  async addChatMessage(message: ChatMessage) {
    return this.chatMessageModel.create(message);
  }
  buildChatMessage(payload: ChatMessagePayload) {
    const message = new Message();
    message.text = payload.text;
    message.type = payload.type;
    message.path = payload.path;
    message.fileName = payload.filename;
    const chatMessage = new ChatMessage();
    chatMessage.chat = payload.chat;
    chatMessage.user = payload.user;
    chatMessage.message = message;
    chatMessage;
    return chatMessage;
  }
  async batchLoadChatMessages(payload: BatchChatMessagePayload) {
    const param: FilterQuery<ChatMessage> = { chat: payload.chat };
    if (payload.fromCreatedAt) {
      param.createdAt = { $lte: payload.fromCreatedAt };
    }
    return this.chatMessageModel
      .find(param)
      .populate('user')
      .sort({
        createdAt: 'desc',
      })
      .limit(payload.limit);
  }
}
