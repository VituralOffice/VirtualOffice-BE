import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
const SALT = 10;
export const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, SALT);
export const comparePassword = (pwd: string, hash: string) => bcrypt.compareSync(pwd, hash);

export const randomHash = (len = 32) => crypto.randomBytes(len).toString('hex');
export const genOtp = (len = 6) => {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}