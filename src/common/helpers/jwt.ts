import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/modules/auth/jwt/jwt.strategy';
export const verifyJwt = (token: string, secret: string) => {
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    return payload;
  } catch (error) {
    console.log(error);
    return null;
  }
};
