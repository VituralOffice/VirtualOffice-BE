import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Room = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.room;
});
