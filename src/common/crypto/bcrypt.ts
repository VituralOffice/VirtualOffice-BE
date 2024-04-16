import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
const SALT = 10;
export const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, SALT);
export const comparePassword = (pwd: string, hash: string) => bcrypt.compareSync(pwd, hash);

export const randomHash = (len = 32) => crypto.randomBytes(len).toString('hex');
