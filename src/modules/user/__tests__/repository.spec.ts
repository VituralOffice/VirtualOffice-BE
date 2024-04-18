import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

import { UserService } from '../adapter';
import { UserRepository } from '../repository';
import { User } from '../schema';

describe('UserRepository', () => {
  let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: UserService,
          useClass: UserRepository,
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
      ],
    }).compile();

    userService = app.get(UserService);
  });
  test('should verify instance', async () => {
    expect(userService).toBeInstanceOf(UserRepository);
  });
});
