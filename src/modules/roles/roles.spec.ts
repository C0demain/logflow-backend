import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterEach, before, describe } from 'node:test';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { UserPayload } from '../auth/authentication.service';
import { Role } from './enums/roles.enum';

describe('Normal user request', () => {
  let app: INestApplication;
  let payloadUser: UserPayload = {
    sub: 'testId',
    username: 'test',
    roles: Role.USER,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
        message: 'User does not have permission',
        error: 'Unauthorized',
        statusCode: 401,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
