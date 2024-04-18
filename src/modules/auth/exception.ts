import { HttpStatus } from '@nestjs/common';
import { ApiException } from 'src/common';

export class UserNotFoundException extends ApiException {
  constructor() {
    super(`email already exist`, HttpStatus.BAD_REQUEST);
  }
}
export class OtpExpiredException extends ApiException {
  constructor() {
    super(`otp expired`, HttpStatus.BAD_REQUEST);
  }
}
export class ExceedIncorrectOtpTryException extends ApiException {
  constructor() {
    super(`enter incorrect otp upto 5 times, try again after 30 minites`, HttpStatus.BAD_REQUEST);
  }
}
