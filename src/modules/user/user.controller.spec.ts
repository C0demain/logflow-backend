import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../roles/enums/roles.enum';
import { Sector } from '../service-order/enums/sector.enum';

describe('UserController', () => {
  let controller: UserController;
  const hashPasswordPipe = new HashPasswordPipe();
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
  };

  const createUserMock: CreateUserDTO = {
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    role: Role.MANAGER,
    sector: Sector.ADMINISTRATIVO,
  };

  beforeEach(async () => {
    const userServiceMock: Partial<UserService> = {
      createUser: jest.fn().mockResolvedValue(userMock),
      listUsers: jest.fn().mockResolvedValue([userMock]),
      updateUser: jest
        .fn()
        .mockResolvedValue({
          ...userMock,
          ...{ name: 'test-username-updated' },
        }),
      deleteUser: jest.fn().mockResolvedValue(userMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        JwtService,
        ConfigService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            save: jest.fn().mockResolvedValue(UserEntity),
            find: jest.fn().mockResolvedValue([new UserEntity()]),
          },
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user', async () => {
    const result = await controller.createUser(
      userMock,
      await hashPasswordPipe.transform(userMock.password),
    );
    expect(result.user).toBeDefined();
    expect(result.user.id).toBeDefined();
    expect(result.user.name).toBe('test-username');
  });

  it('should get all users', async () => {
    const result = await controller.listUsers();

    expect(result.users).toBeDefined();
    expect(result.users).toHaveLength(1);
  });

  it('should update user', async () => {
    const result = await controller.updateUser(userMock.id, userMock);

    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(userMock.id);
    expect(result.user.name).toBe('test-username-updated');
  });

  it('should delete user', async () => {
    const result = await controller.removeUser(userMock.id);

    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(userMock.id);
  });
});
