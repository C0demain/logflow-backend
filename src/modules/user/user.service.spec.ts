import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/modules/user/dto/CreateUser.dto';
import { UpdateUserDTO } from 'src/modules/user/dto/UpdateUser.dto';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { Repository } from 'typeorm';
import { Role } from '../roles/enums/roles.enum';
import { Sector } from '../service-order/enums/sector.enum';

describe('ServiceOrderService', () => {
  let service: UserService;
  let repository: Repository<UserEntity>;

  const userMock: UserEntity = {
    id: 'uuid-uuid',
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    createdAt: '2024-01-01',
    role: Role.MANAGER,
    sector: Sector.OPERACIONAL,
    isActive: true,
    orders: [],
    tasks: [],
  };

  const createUserMock: CreateUserDTO = {
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    role: Role.MANAGER,
    sector: Sector.OPERACIONAL,
    isActive: true,
  };

  const updateUserMock: UpdateUserDTO = {
    name: 'test-username-updated',
    email: 'testuser@gmail.com',
    password: '123456',
    role: Role.EMPLOYEE,
    sector: Sector.OPERACIONAL,
    isActive: true
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
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async () => {
    repository.save = jest.fn().mockResolvedValue(userMock);
    const newUser = await service.createUser(createUserMock);

    expect(newUser).toEqual(userMock);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should list all users', async () => {
    repository.find = jest.fn().mockResolvedValue([userMock]);

    const userList = await service.listUsers();

    expect(userList).toEqual([
      {
        id: 'uuid-uuid',
        name: 'test-username',
        role: Role.MANAGER,
        isActive: true,
        email: "testuser@gmail.com",
        sector: Sector.OPERACIONAL
      },
    ]);

    expect(repository.find).toHaveBeenCalled();
  });

  it('should return user by email', async () => {
    repository.findOne = jest.fn().mockResolvedValue(userMock);

    const userList = await service.findByEmail(userMock.email);

    expect(userList).toEqual(userMock);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: userMock.email },
    });
  });

  it('should update user', async () => {
    repository.findOneBy = jest.fn().mockResolvedValue(userMock);

    const updatedUser = await service.updateUser(userMock.id, updateUserMock);
    const newUser = userMock;
    newUser.name = 'test-username-updated';

    expect(updatedUser).toEqual(newUser);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: userMock.id });
    expect(repository.save).toHaveBeenCalledWith(newUser);
  });

  it('should delete user', async () => {
    repository.save = jest.fn().mockResolvedValue(userMock);
    repository.findOneBy = jest.fn().mockResolvedValue(userMock);

    const oldUser = await service.deleteUser(userMock.id);

    expect(oldUser).toEqual(userMock);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: userMock.id });
    expect(repository.save).toHaveBeenCalledWith(userMock);
  });

  it('should throw NotFoundException when user is not found in findByEmail', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.findByEmail('notvalidemail@gmail.com'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when user is not found in update', async () => {
    repository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(service.updateUser('uu1d-uu1d', userMock)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when user is not found in delete', async () => {
    repository.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(service.deleteUser('uu1d-uu1d')).rejects.toThrow(
      NotFoundException,
    );
  });
});
