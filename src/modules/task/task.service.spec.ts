import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { ServiceOrderService } from 'src/modules/service-order/service-order.service';
import { CreateTaskDto } from 'src/modules/task/dto/create-task.dto';
import { GetTaskDto } from 'src/modules/task/dto/get-task.dto';
import { Task } from 'src/modules/task/entities/task.entity';
import { UserService } from 'src/modules/user/user.service';
import { Repository } from 'typeorm';
import { AddressDto } from '../client/dto/address.dto';
import { TaskStage } from './enums/task.stage.enum';
import { TaskService } from './task.service';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { Process } from 'src/modules/process/entities/process.entity';
import { ProcessService } from 'src/modules/process/process.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

describe('TaskService', () => {
  let service: TaskService;
  let repo: Repository<Task>;
  let vehicleRepository: Repository<Vehicle>;
  let processService: ProcessService;
  let userService: UserService;
  let serviceOrderService: ServiceOrderService;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
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

  const processMock: Process = {
    id: 'process-1',
    title: 'Process 1',
    tasks: [],
  }

  const mockProcessService = {
    create: jest.fn().mockResolvedValue(processMock),
    findAll: jest.fn().mockResolvedValue([processMock]),
    findById: jest.fn().mockResolvedValue(processMock),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
        { 
          provide: getRepositoryToken(Vehicle),
          useClass: Repository 
        },
        {
          provide: ProcessService,
          useValue: mockProcessService,
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
    vehicleRepository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    processService = module.get<ProcessService>(ProcessService);
    userService = module.get<UserService>(UserService);
    serviceOrderService = module.get<ServiceOrderService>(ServiceOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'task-title',
        orderId: 'order1',
        userId: 'user1',
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        role: 'role1',
        completedAt: new Date(),
      };

      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'task-title',
        startedAt: null,
        completedAt: null,
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockRepository.save.mockResolvedValue(expectedResult);

      const createdTask = await service.create(createTaskDto);
      expect(createdTask).toEqual(expectedResult);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'task-title',
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          taskCost: null,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({});

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        loadEagerRelations: true,
        where: {
          process: undefined
        },
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
          taskCost: null,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({ title: 'Task1' });

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        loadEagerRelations: true,
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
          taskCost: null,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({ serviceOrderId: 'order1' });

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        loadEagerRelations: true,
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
          taskCost: null,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll({ assignedUserId: 'user1' });

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        loadEagerRelations: true,
        where: { assignedUser: { id: 'user1' } },
        order: { createdAt: 'asc' },
      });
    });
    
    it('should return tasks filtered by date range', async () => {
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          taskCost: null,
          assignedUser: mockedUser,
          serviceOrder: mockedServiceOrder,
        },
      ];

      const filters = {
        completedFrom: new Date('2024-01-01'),
        completedTo: new Date('2024-02-01'),
      };

      mockRepository.find.mockResolvedValue(expectedResult);

      const tasks = await service.findAll(filters);

      expect(tasks).toEqual(expectedResult);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          completedAt: expect.objectContaining({
            _type: 'between',
            _value: [filters.completedFrom, filters.completedTo],
          }),
        }),
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
        taskCost: null,
        assignedUser: mockedUser,
        serviceOrder: mockedServiceOrder,
      };

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

  describe('countOverdueTasks', () => {
    it('should return the count of overdue tasks', async () => {
      const filters = { 
        startedAt: '2024-01-01',
        dueDate: '2024-02-01', 
        sector: Sector.OPERACIONAL 
      };
      
      const expectedCount = 5; 
  
      mockRepository.getCount.mockResolvedValue(expectedCount);
  
      const count = await service.countOverdueTasks(filters);
  
      expect(count).toBe(expectedCount);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockRepository.andWhere).toHaveBeenCalledTimes(4);
      expect(mockRepository.getCount).toHaveBeenCalled();
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
        serviceOrder: mockedServiceOrder,
      };

      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ title: 'Task1' },
      });
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.update('task1', {
        title: 'Task2',
        startedAt: new Date(),
        dueDate: new Date(),
        completedAt: new Date(),
        userId: 'user1',
        orderId: 'order1',
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        address: new AddressDto(),
      });

      expect(task).toEqual(expectedResult);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'task1' });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'task1',
          title: 'Task2',
        }),
      );
      expect(mockUserService.findById).toHaveBeenCalledWith('user1');
      expect(mockServiceOrderService.findById).toHaveBeenCalledWith('order1');
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(
        service.update('task1', {
          title: 'Task2',
          startedAt: new Date(),
          dueDate: new Date(),
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
        assignedUser: mockedUser,
        serviceOrder: mockedServiceOrder,
      };

      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ completedAt: null },
      });
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.complete('task1');

      expect(task).toEqual(expectedResult);
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(service.complete('task1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('uncomplete', () => {
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

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(service.complete('task1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('assign', () => {
    it('should assign a task to a user', async () => {
      const expectedResult = {
        id: 'task1',
        title: 'Task1',
        completedAt: null,
        sector: Sector.OPERACIONAL,
        assignedUser: mockedUser,
        serviceOrder: mockedServiceOrder,
      };

      mockRepository.findOneBy.mockResolvedValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.assign('task1', { userId: 'user1' });

      expect(task).toEqual(expectedResult);
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(
        service.assign('task1', { userId: 'user1' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('unassign', () => {
    it('should unassign a task', async () => {
      const expectedResult = {
        id: 'task1',
        title: 'Task1',
        completedAt: null,
        sector: Sector.OPERACIONAL,
        assignedUser: {
          id: 'null',
          name: 'Nenhum usuário atribuído a esta tarefa',
          email: 'null',
        },
        serviceOrder: mockedServiceOrder,
      };

      mockRepository.findOneBy.mockResolvedValue({
        ...expectedResult,
        ...{ assignedUser: mockedUser },
      });
      mockRepository.save.mockResolvedValue(expectedResult);

      const task = await service.unassign('task1');

      expect(task).toEqual(expectedResult);
    });

    it('should throw NotFoundException when id is invalid', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      expect(service.unassign('task1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('addCost', () => {
    it('should add a cost to a task', async () => {
      const taskId = 'task1';
      const cost = 500;
      const expectedTask = {
        id: taskId,
        title: 'Task1',
        taskCost: cost,
        dueDate: null,
        sector: 'OPERACIONAL',
        startedAt: undefined,
        completedAt: undefined,
        stage: undefined,
        assignedUser: {
          id: "null",
          name: "Nenhum usuário atribuído a esta tarefa",
          email: "null",
        },
        serviceOrder: undefined,
        address: undefined,
        files: undefined, 
      };
  
      mockRepository.findOneBy.mockResolvedValue({ id: taskId, title: 'Task1', taskCost: null });
      mockRepository.save.mockResolvedValue(expectedTask);
  
      const result = await service.addCost(taskId, cost);
  
      expect(result).toEqual(expectedTask);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: taskId });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ taskCost: cost }));
    });
  
    it('should throw NotFoundException when task ID is invalid', async () => {
      const taskId = 'invalidTaskId';
  
      mockRepository.findOneBy.mockResolvedValue(null);
  
      await expect(service.addCost(taskId, 500)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: taskId });
    });
  });

  describe('updateDueDate', () => {
    it('should update the due date of a task', async () => {
      const taskId = 'task1';
      const dueDate = new Date('2024-12-31');
      const expectedTask = {
        id: taskId,
        title: 'Task1',
        taskCost: null,
        dueDate: dueDate,
        sector: 'OPERACIONAL',
        startedAt: undefined,
        completedAt: undefined,
        stage: undefined,
        assignedUser: {
          id: "null",
          name: "Nenhum usuário atribuído a esta tarefa",
          email: "null",
        },
        serviceOrder: undefined,
        address: undefined,
        files: undefined,
      };
  
      mockRepository.findOne.mockResolvedValue({ id: taskId, title: 'Task1', taskCost: null, dueDate: null });
      mockRepository.save.mockResolvedValue(expectedTask);
  
      const result = await service.updateDueDate(taskId, dueDate);
  
      expect(result).toEqual(expectedTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ dueDate: dueDate }));
    });
  
    it('should throw NotFoundException when task ID is invalid', async () => {
      const taskId = 'invalidTaskId';
      const dueDate = new Date('2024-12-31');
  
      mockRepository.findOne.mockResolvedValue(null);
  
      await expect(service.updateDueDate(taskId, dueDate)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
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
        taskCost: null,
        assignedUser: mockedUser,
        serviceOrder: mockedServiceOrder,
      };

      mockRepository.findOneBy.mockResolvedValue(expectedResult);

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
