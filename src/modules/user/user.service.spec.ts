import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/modules/user/dto/CreateUser.dto';
import { UpdateUserDTO } from 'src/modules/user/dto/UpdateUser.dto';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { Repository } from 'typeorm';
import { RoleEntity } from '../roles/roles.entity'; 
import { Sector } from '../service-order/enums/sector.enum';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let roleRepository: Repository<RoleEntity>;

  const roleMock: RoleEntity = {
    id: 'uuid-role',
    name: 'Gerente Operacional',
    description: 'Gerencia as operações da empresa',
    sector: Sector.OPERACIONAL,
  };

  const userMock: UserEntity = {
    id: 'uuid-uuid',
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    createdAt: '2024-01-01',
    role: roleMock,
    sector: Sector.OPERACIONAL,
    isActive: true,
    orders: [],
    tasks: [],
    files: [],
  };

  const createUserMock: CreateUserDTO = {
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    role: 'Gerente Operacional',
    sector: Sector.OPERACIONAL,
    isActive: true,
  };

  const updateUserMock: UpdateUserDTO = {
    name: 'test-username-updated',
    email: 'testuser@gmail.com',
    password: '123456',
    role: "Gerente Operacional",
    sector: Sector.OPERACIONAL,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            save: jest.fn().mockResolvedValue(userMock),
            find: jest.fn().mockResolvedValue([userMock]),
            findOneBy: jest.fn().mockResolvedValue(userMock),
            findOne: jest.fn().mockResolvedValue(userMock),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            save: jest.fn().mockResolvedValue(roleMock),
            findOneBy: jest.fn().mockResolvedValue(roleMock),
            findOne: jest.fn().mockResolvedValue(roleMock),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async () => {
    userRepository.save = jest.fn().mockResolvedValue(userMock);
    const newUser = await service.createUser(createUserMock);

    expect(newUser).toEqual(userMock);
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should list all users', async () => {
    userRepository.find = jest.fn().mockResolvedValue([userMock]);

    const userList = await service.listUsers();

    expect(userList).toEqual([{
        id: 'uuid-uuid',
        name: 'test-username',
        role: 'Gerente Operacional',
        isActive: true,
        email: "testuser@gmail.com",
        sector: Sector.OPERACIONAL,
      },
    ]);

    expect(userRepository.find).toHaveBeenCalled();
  });

  it('should return user by email', async () => {
    userRepository.findOne = jest.fn().mockResolvedValue(userMock);

    const userList = await service.findByEmail(userMock.email);

    expect(userList).toEqual(userMock);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: userMock.email },
    });
  });

  it('should update user', async () => {
    userRepository.findOneBy = jest.fn().mockResolvedValue(userMock);

    const updatedUser = await service.updateUser(userMock.id, updateUserMock);
    const newUser = { ...userMock, name: 'test-username-updated' };

    expect(updatedUser).toEqual(newUser);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userMock.id });
    expect(userRepository.save).toHaveBeenCalledWith(newUser);
  });

  it('should delete user', async () => {
    userRepository.save = jest.fn().mockResolvedValue(userMock);
    userRepository.findOneBy = jest.fn().mockResolvedValue(userMock);

    const oldUser = await service.deleteUser(userMock.id);

    expect(oldUser).toEqual(userMock);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userMock.id });
    expect(userRepository.save).toHaveBeenCalledWith(userMock);
  });

  it('should throw NotFoundException when user is not found in findByEmail', async () => {
    userRepository.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.findByEmail('notvalidemail@gmail.com'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when user is not found in update', async () => {
    userRepository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(service.updateUser('uu1d-uu1d', updateUserMock)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when user is not found in delete', async () => {
    userRepository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(service.deleteUser('uu1d-uu1d')).rejects.toThrow(
      NotFoundException,
    );
  });
});
