export enum RoomType {
  LOBBY = 'lobby',
  PUBLIC = 'skyoffice',
  CUSTOM = 'custom',
}

export interface IRoomData {
  _id: string;
  name: string;
  private: boolean;
  active: boolean;
  autoDispose: boolean;
  creator: string;
  map: IMapData;
  members: IRoomMember[];
}
export interface IMapData {
  _id: string;
  active: boolean;
  capacity: number;
  createdAt: string;
  default: boolean;
  icon: string;
  id: string;
  json: string;
  name: string;
  style: string;
  totalChair: number;
  totalMeeting: number;
  totalWhiteboard: number;
}

export interface IRoomMember {
  online: boolean;
  user: IUser;
  role: string;
}
export interface IUser {
  _id: string;
  email: string;
  fullname: string;
  avatar: string;
  role: string;
  online: boolean;
  password: string;
  character: string | ICharacter;
}
export interface ICharacter {
  _id: string;
  name: string;
  avatar: string;
}
