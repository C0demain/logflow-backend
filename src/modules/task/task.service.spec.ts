import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { Task } from 'src/modules/task/entities/task.entity';
import { UserService } from 'src/modules/user/user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceOrderService } from 'src/modules/service-order/service-order.service';
import { CreateTaskDto } from 'src/modules/task/dto/create-task.dto';
import { GetTaskDto } from 'src/modules/task/dto/get-task.dto';
import { NotFoundException } from '@nestjs/common';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { AddressDto } from '../client/dto/address.dto';
import { TaskStage } from './enums/task.stage.enum';

describe('TaskService', () => {
  let service: TaskService;
  let repo: Repository<Task>;
  let userService: UserService;
  let serviceOrderService: ServiceOrderService;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockedUser = {
    id: 'user1',
    name: 'User1',
    email: 'user1@gmail.com',
  };

  const mockUserService = {
    findById: jest.fn().mockResolvedValue(mockedUser),
  };

  const mockedServiceOrder = {
    id: 'order1',
    title: 'Order1',
  };

  const mockServiceOrderService = {
    findById: jest.fn().mockResolvedValue(mockedServiceOrder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ServiceOrderService,
          useValue: mockServiceOrderService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
    userService = module.get<UserService>(UserService);
    serviceOrderService = module.get<ServiceOrderService>(ServiceOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async ()=>{
    const createTaskDto: CreateTaskDto = {
      title: 'task-title',
      orderId: 'order1',
      userId: 'user1',
      sector: Sector.OPERACIONAL,
      stage: TaskStage.SALE_COMPLETED,
      role: 'role1',
      completedAt: new Date(),
    }

    const expectedResult: GetTaskDto = {
      id: 'task1',
      title: 'task-title',
      startedAt: null,
      completedAt: null,
      sector: Sector.OPERACIONAL,
      stage: TaskStage.SALE_COMPLETED,
      serviceOrder: mockedServiceOrder,
      assignedUser: mockedUser
    }

    mockRepository.save.mockResolvedValue(expectedResult)

    const createdTask = await service.create(createTaskDto)
    expect(createdTask).toEqual(expectedResult)
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'task-title',
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser
    }));

  })})

  describe('findAll', ()=>{
    it('should return all tasks', async ()=>{
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({});

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'asc' },
      });
    });

    it('should return tasks filtered by title', async () => {
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({ title: 'Task1' });

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { title: 'Task1' },
        order: { createdAt: 'asc' },
      });
    });

    it('should return tasks filtered by serviceOrderId', async () => {
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({ serviceOrderId: 'order1' });

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { serviceOrder: { id: 'order1' } },
        order: { createdAt: 'asc' },
      });
    });

    it('should return tasks filtered by assignedUserId', async () => {
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({ assignedUserId: 'user1' });

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { assignedUser: { id: 'user1' } },
        order: { createdAt: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      const expectedResult: GetTaskDto = {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder
        }

      mockRepository.findOneBy.mockResolvedValue(expectedResult);

      const task = await service.findById('task1');

      expect(task).toEqual(expectedResult);
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(service.findById('task1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task by id', async () => {
      const expectedResult = {
          id: 'task1',
          title: 'Task2',
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder
        }
      
      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ title: 'Task1' },
      });
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.update('task1', {
        title: 'Task2',
        startedAt: new Date(),
        completedAt: new Date(),
        userId: 'user1',
        orderId: 'order1',
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        address: new AddressDto
      })

      expect(task).toEqual(expectedResult)
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'task1' });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'task1',
        title: 'Task2',
      }));
      expect(mockUserService.findById).toHaveBeenCalledWith('user1');
      expect(mockServiceOrderService.findById).toHaveBeenCalledWith('order1');
    })

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(
        service.update('task1', {
          title: 'Task2',
          startedAt: new Date(),
          completedAt: new Date(),
          userId: 'user1',
          orderId: 'order2',
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          address: new AddressDto(),
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('start', () => {
    it('should start a task', async () => {
      const expectedResult = {
        id: 'task1',
        title: 'Task1',
        startedAt: new Date(),
        completedAt: null,
        sector: Sector.OPERACIONAL,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ completedAt: null },
      });
      mockRepository.save.mockResolvedValue(expectedResult);
      
      const task = await service.start('task1');

      expect(task).toEqual(expectedResult);
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(service.start('task1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should mark a task as completed', async () => {
      const expectedResult = {
        id: 'task1',
        title: 'Task1',
        completedAt: new Date(),
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        address: new AddressDto(),
      }
    
      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ completedAt: null },
      });
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.complete('task1');

      expect(task).toEqual(expectedResult);
    });

    it('should mark a task as not completed', async () => {
      const expectedResult = {
        id: 'task1',
        title: 'Task1',
        completedAt: null,
        sector: Sector.OPERACIONAL,
        assignedUser: mockedUser,
        serviceOrder: mockedServiceOrder,
      };

      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ completedAt: new Date() },
      });
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.complete('task1');

      expect(task).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a task by id', async () => {
      const expectedResult: GetTaskDto = {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder
        }
      
      mockRepository.findOneBy.mockResolvedValue(expectedResult)

      mockRepository.findOneBy.mockResolvedValue(expectedResult);

      const task = await service.remove('task1');

      expect(task).toEqual(expectedResult);
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(service.findById('task1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
