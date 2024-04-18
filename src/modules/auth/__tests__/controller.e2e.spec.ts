import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenModule } from 'src/modules/auth/module';
import { SecretsModule } from 'src/modules/global/secrets/module';
import { Model } from 'mongoose';
import * as request from 'supertest';

import { UserService } from '../../user/adapter';
import { UserEntity } from '../../user/entity';
import { UserRepository } from '../../user/repository';
import { User } from '../../user/schema';
import { IAuthService } from '../adapter';
import { AuthController } from '../controller';
import { authService } from '../service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  // if you want to mock model functions
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TokenModule, SecretsModule],
      controllers: [AuthController],
      providers: [
        {
          provide: IAuthService,
          useClass: authService,
        },
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

    model = module.get(getModelToken(User.name));
    app = module.createNestApplication();
    await app.init();
  });

  describe('/login (POST)', () => {
    it(`should login successfully`, async () => {
      model.findOne = jest.fn().mockResolvedValue({
        login: 'mockLogin',
        pass: 'passMock',
        id: 'idMock',
      } as UserEntity);
      const response = await request(app.getHttpServer()).post('/login').send({ login: 'mockLogin', pass: 'passMock' });

      expect(response.body).toHaveProperty('token');

      return response;
    });

    it(`should throw "username or password is invalid" error`, async () => {
      model.findOne = jest.fn();
      return await request(app.getHttpServer())
        .post('/login')
        .send({ login: 'mockLogin', pass: 'passMock' })
        .expect(412);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
