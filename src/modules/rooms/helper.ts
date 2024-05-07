import { randomInt } from 'crypto';

export const genChatName = () => {
  return `voffice-chat-${randomInt(10e6)}`;
};
