import { Reflector } from '@nestjs/core';
import { ROLE } from '../enum/role';

export const Roles = Reflector.createDecorator<ROLE[]>();
