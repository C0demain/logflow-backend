import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { UserPayload } from '../auth/authentication.service';
import { Role } from './enums/roles.enum';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { Sector } from '../service-order/enums/sector.enum';

describe('Normal user request', () => {
  let app: INestApplication;
  let payloadUser: UserPayload = {
    sub: 'testId',
    username: 'test',
    roles: Role.EMPLOYEE,
  };

  const userMock: UserEntity = {
    id: 'uuid-uuid',
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    role: Role.MANAGER,
    sector: Sector.ADMINISTRATIVO,
    orders:[],
    tasks: []
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(userMock),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = payloadUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`should return an Unauthorized Error - User does not have permission`, () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .expect(401)
      .expect({
        message: 'Usuário sem permissão',
        error: 'Unauthorized',
        statusCode: 401,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
