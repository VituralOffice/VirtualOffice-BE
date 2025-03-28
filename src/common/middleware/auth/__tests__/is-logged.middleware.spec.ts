import { Test } from '@nestjs/testing';
import { ITokenService } from 'src/modules/token/adapter';
import { ILoggerService } from 'src/modules/global/logger/adapter';
import { MockUtils } from 'src/common/tests/mock-utils';

import { IsLoggedMiddleware } from '../is-logged.middleware';

describe('IsLoggedMiddleware', () => {
  let isLoggedMiddleware: IsLoggedMiddleware;
  let tokenService: ITokenService;
  beforeEach(async () => {
    jest.clearAllMocks();
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: ITokenService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: IsLoggedMiddleware,
          useClass: IsLoggedMiddleware,
        },
        {
          provide: ILoggerService,
          useValue: {
            pino: jest.fn(),
          },
        },
      ],
    }).compile();

    isLoggedMiddleware = app.get(IsLoggedMiddleware);
    tokenService = app.get(ITokenService);
  });

  describe('use', () => {
    test('should throw "no token provided" errro', async () => {
      await expect(
        isLoggedMiddleware.use(
          MockUtils.setMock({ headers: {} }),
          MockUtils.setMock({ status: () => jest.fn() }),
          () => ({}),
        ),
      ).rejects.toThrow('no token provided');
    });

    test('should use successfully', async () => {
      tokenService.verify = jest.fn().mockResolvedValue({ userId: 'mockId' });

      await expect(
        isLoggedMiddleware.use(
          MockUtils.setMock({
            headers: { authorization: 'Bearer validToken' },
          }),
          MockUtils.setMock({ status: () => jest.fn() }),
          () => ({}),
        ),
      ).resolves.toEqual(undefined);
    });
  });
});
