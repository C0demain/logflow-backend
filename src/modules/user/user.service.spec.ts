import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/modules/user/dto/CreateUser.dto';
import { UpdateUserDTO } from 'src/modules/user/dto/UpdateUser.dto';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { Repository } from "typeorm";

describe('ServiceOrderService', () => {
  let service: UserService;
  let repository: Repository<UserEntity>;

  const userMock: UserEntity = {
    id: 'uuid-uuid',
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: '2024-01-01'
  }

  const createUserMock: CreateUserDTO = {
    name: 'test-username',
    email: 'testuser@gmail.com',
    password: '123456'
  }

  const updateUserMock: UpdateUserDTO = {
    name: 'test-username-updated',
    email: 'testuser@gmail.com',
    password: '123456'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            save: jest.fn().mockResolvedValue(userMock),
            find: jest.fn().mockResolvedValue([userMock])
          }
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async ()=>{
    repository.save = jest.fn().mockResolvedValue(userMock);
    const newUser = await service.createUser(createUserMock)

    expect(newUser).toEqual(userMock);
    expect(repository.save).toHaveBeenCalled()
  })

  it('should list all users', async ()=>{
    repository.find = jest.fn().mockResolvedValue([userMock])

    const userList = await service.listUsers()
    

    expect(userList).toEqual([{id: 'uuid-uuid', name: 'test-username'}])
    expect(repository.find).toHaveBeenCalled()
  })

  it('should return user by email', async ()=>{
    repository.findOne = jest.fn().mockResolvedValue(userMock)

    const userList = await service.findByEmail(userMock.email)
    

    expect(userList).toEqual(userMock)
    expect(repository.findOne).toHaveBeenCalledWith({where: {email: userMock.email} })
  })

  it('should update user', async ()=>{
    repository.findOneBy = jest.fn().mockResolvedValue(userMock)

    const updatedUser = await service.updateUser(userMock.id, updateUserMock)
    const newUser = userMock
    newUser.name = 'test-username-updated'
    

    expect(updatedUser).toEqual(newUser)
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: userMock.id})
    expect(repository.save).toHaveBeenCalledWith(newUser)
  })

  it('should delete user', async ()=>{
    repository.delete = jest.fn().mockResolvedValue(userMock)
    repository.findOneBy = jest.fn().mockResolvedValue(userMock)

    const oldUser = await service.deleteUser(userMock.id)

    expect(oldUser).toEqual(userMock)
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: userMock.id})
    expect(repository.delete).toHaveBeenCalledWith(userMock.id)
  })
});
