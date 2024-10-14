import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { ConfigService } from '@nestjs/config';
import { RoleEntity } from '../roles/roles.entity'; 
import { Sector } from '../service-order/enums/sector.enum';
import { AuthenticationGuard } from '../auth/authentication.guard';

describe('UserController', () => {
  let controller: UserController;
  const hashPasswordPipe = new HashPasswordPipe();

  // Mockando a Role como string, já que no DTO ela é tratada assim
  const roleMockName = 'Gerente Operacional';

  const userMock: UserEntity = {
    id: 'uuid-uuid',
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    createdAt: '2024-01-01',
    role: { id: 'uuid-role', name: roleMockName } as RoleEntity, // A role está como objeto completo
    sector: Sector.OPERACIONAL,
    isActive: true,
    orders: [],
    tasks: [],
  };

  // CreateUserDTO mantém role como string
  const createUserMock: CreateUserDTO = {
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    role: roleMockName,  // Role é string
    sector: Sector.OPERACIONAL,
    isActive: true,
  };

  // Service Mock
  beforeEach(async () => {
    const userServiceMock: Partial<UserService> = {
      createUser: jest.fn().mockResolvedValue(userMock),
      listUsers: jest.fn().mockResolvedValue([
        {
          ...userMock,
          role: roleMockName, // Aqui retornamos a string no lugar do objeto
        },
      ]),
      updateUser: jest.fn().mockResolvedValue({
        ...userMock,
        name: 'test-username-updated',
        role: roleMockName,  // Aqui também retornamos a string
      }),
      deleteUser: jest.fn().mockResolvedValue(userMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            save: jest.fn().mockResolvedValue(userMock),
            find: jest.fn().mockResolvedValue([userMock]),
            findOne: jest.fn().mockResolvedValue(userMock),
            update: jest.fn().mockResolvedValue(userMock),
            delete: jest.fn().mockResolvedValue(userMock),
          },
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        ConfigService,
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user', async () => {
    const result = await controller.createUser(
      createUserMock,
      await hashPasswordPipe.transform(userMock.password),
    );
    expect(result.user).toBeDefined();
    expect(result.user.id).toBeDefined();
    expect(result.user.name).toBe(userMock.name);
    expect(result.user.role).toBe(roleMockName); // Verificamos a string "role"
  });

  it('should get all users', async () => {
    const result = await controller.listUsers();
    expect(result.users).toBeDefined();
    expect(result.users).toHaveLength(1);
    expect(result.users[0].id).toBe(userMock.id);
    expect(result.users[0].role).toBe(roleMockName); // Verificamos a string "role"
  });

  it('should update user', async () => {
    const result = await controller.updateUser(userMock.id, {
      ...userMock,
      role: roleMockName,  // Simulamos a atualização com a string da role
    });

    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(userMock.id);
    expect(result.user.name).toBe('test-username-updated');
    expect(result.user.role).toBe(roleMockName); // Verificamos a string "role"
  });

  it('should delete user', async () => {
    const result = await controller.removeUser(userMock.id);

    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(userMock.id);
  });
});
