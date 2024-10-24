import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { JwtService } from '@nestjs/jwt';
import { CreateTaskDto } from 'src/modules/task/dto/create-task.dto';
import { GetTaskDto } from 'src/modules/task/dto/get-task.dto';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { AddressDto } from '../client/dto/address.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const createTaskDto: CreateTaskDto = {
    title: 'Task1',
    orderId: 'order1',
    userId: 'user1',
    completed: false,
    sector: Sector.OPERACIONAL,
    role: 'role1'
  };

  const mockedUser = {
    id: 'user1',
    name: 'User1',
    email: 'user1@gmail.com',
  };

  const mockedServiceOrder = {
    id: 'order1',
    title: 'Order1',
  };

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue('jwt-token'),
    verify: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task without address', async () => {
      const expectedResult: GetTaskDto = new GetTaskDto(
        'task1',
        'Task1',
        Sector.OPERACIONAL,
        false,
        {
          id: 'user1',
          name: 'User1',
          email: 'user1@gmail.com',
        },
        {
          id: 'order1',
          title: 'Order1',
        },
      );
      mockTaskService.create.mockResolvedValue(expectedResult);

      const response = await controller.create(createTaskDto);

      expect(response).toEqual({
        message: 'Tarefa criada com sucesso',
        task: expectedResult,
      });

      expect(mockTaskService.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should return all tasks without address', async () => {
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          completed: false,
          sector: Sector.OPERACIONAL,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser,
        },
      ];
      mockTaskService.findAll.mockResolvedValue(expectedResult);

      const response = await controller.findAll();

      expect(response.message).toEqual('Tarefas obtidas com sucesso');
      expect(response.tasks).toEqual(expectedResult);
      expect(mockTaskService.findAll).toHaveBeenCalledWith({});
    });

    // Casos de filtro continuam os mesmos.
  });

  describe('findById', () => {
    it('should return task by id without address', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        completed: false,
        sector: Sector.OPERACIONAL,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.findById.mockResolvedValue(expectedResult);

      const response = await controller.findById('task1');

      expect(response.message).toEqual('Tarefa obtida com sucesso');
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.findById).toHaveBeenCalledWith('task1');
    });
  });

  describe('update', () => {
    it('should update task by id, with optional address', async () => {
      const expectedResult: GetTaskDto = new GetTaskDto(
        'task1',
        'Task1',
        Sector.OPERACIONAL,
        false,
        {
          id: 'user1',
          name: 'User1',
          email: 'user1@gmail.com',
        },
        {
          id: 'order1',
          title: 'Order1',
        },
        {
          zipCode: '12345-678',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua A',
          number: '123',
          complement: 'Apto 456',
        }
      );

      mockTaskService.update.mockResolvedValue(expectedResult);

      const updateTaskDto = {
        title: 'Task1',
        completed: false,
        userId: mockedUser.id,
        orderId: 'order1',
        sector: Sector.OPERACIONAL,
        address: new AddressDto(), // address opcional
      };

      const response = await controller.update('task1', updateTaskDto);

      expect(response.message).toEqual('Tarefa atualizada com sucesso');
      expect(response.task).toEqual(expectedResult);

      expect(mockTaskService.update).toHaveBeenCalledWith('task1', updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove task by id', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        completed: false,
        sector: Sector.OPERACIONAL,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.remove.mockResolvedValue(expectedResult);

      const response = await controller.remove('task1');

      expect(response.message).toEqual('Tarefa excluída com sucesso');
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.remove).toHaveBeenCalledWith('task1');
    });
  });
});