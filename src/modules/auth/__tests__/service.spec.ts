import { Test } from '@nestjs/testing';

import { UserService } from '../../user/adapter';
import { IAuthService } from '../adapter';
import { authService } from '../service';

describe('authService', () => {
  let authService: IAuthService;
  let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: IAuthService,
          useClass: authService,
        },
        {
          provide: UserService,
          useValue: {
            logged: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = app.get(IAuthService);
    userService = app.get(UserService);
  });

  describe('login', () => {
    const user = { login: 'mock', pass: 'pass' };
    test('should login successfully', async () => {
      userService.findOne = jest.fn().mockResolvedValue(user);
      await expect(authService.login(user)).resolves.toEqual(user);
    });

    test('should throw "not found login" error', async () => {
      userService.findOne = jest.fn();
      await expect(authService.login(user)).rejects.toThrow('username or password is invalid.');
    });
  });
});
