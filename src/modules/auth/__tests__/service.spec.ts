import { Test } from '@nestjs/testing';

import { IUserRepository } from '../../user/adapter';
import { IAuthService } from '../adapter';
import { authService } from '../service';

describe('authService', () => {
  let authService: IAuthService;
  let userRepository: IUserRepository;

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
          provide: IUserRepository,
          useValue: {
            logged: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = app.get(IAuthService);
    userRepository = app.get(IUserRepository);
  });

  describe('login', () => {
    const user = { login: 'mock', pass: 'pass' };
    test('should login successfully', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      await expect(authService.login(user)).resolves.toEqual(user);
    });

    test('should throw "not found login" error', async () => {
      userRepository.findOne = jest.fn();
      await expect(authService.login(user)).rejects.toThrow('username or password is invalid.');
    });
  });
});
