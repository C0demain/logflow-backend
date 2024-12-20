import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { CreateTaskDto } from 'src/modules/task/dto/create-task.dto';
import { GetTaskDto } from 'src/modules/task/dto/get-task.dto';
import { AddressDto } from '../client/dto/address.dto';
import { TaskStage } from './enums/task.stage.enum';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const createTaskDto: CreateTaskDto = {
    title: 'Task1',
    orderId: 'order1',
    userId: 'user1',
    completedAt: new Date(),
    sector: Sector.OPERACIONAL,
    stage: TaskStage.SALE_COMPLETED,
    role: 'role1',
  };

  const mockedUser = {
    id: 'user1',
    name: 'User1',
    email: 'user1@gmail.com',
  };

  const mockedServiceOrder = {
    id: 'order1',
    code: 'Order1',
  };

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    countOverdueTasks: jest.fn(),
    update: jest.fn(),
    start: jest.fn(),
    complete: jest.fn(),
    uncomplete: jest.fn(),
    assign: jest.fn(),
    unassign: jest.fn(),
    addCost: jest.fn(),
    updateDueDate: jest.fn(),
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
        null,
        null,
        null,
        Sector.OPERACIONAL,
        TaskStage.SALE_COMPLETED,
        null,
        {
          id: 'user1',
          name: 'User1',
          email: 'user1@gmail.com',
        },
        {
          id: 'order1',
          code: 'Order1',
        },
      );
      mockTaskService.create.mockResolvedValue(expectedResult);

      const response = await controller.create(createTaskDto);

      expect(response).toEqual({
        message: 'Tarefa criada com sucesso.',
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
          startedAt: null,
          completedAt: null,
          sector: Sector.OPERACIONAL,
          stage: TaskStage.SALE_COMPLETED,
          taskCost: null,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser,
        },
      ];
      mockTaskService.findAll.mockResolvedValue(expectedResult);

      const response = await controller.findAll();

      expect(response.message).toEqual('Tarefas obtidas com sucesso.');
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
        startedAt: null,
        completedAt: null,
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.findById.mockResolvedValue(expectedResult);

      const response = await controller.findById('task1');

      expect(response.message).toEqual('Tarefa obtida com sucesso.');
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.findById).toHaveBeenCalledWith('task1');
    });
  });

  describe('getOverdueTasksCount', () => {
    it('should return the number of tasks completed after due date', async () => {
      const filters: FilterTasksDto = {
        dueDate: '2024-02-01',
        sector: Sector.OPERACIONAL,
      };

      const expectedCount = 5;
      mockTaskService.countOverdueTasks.mockResolvedValue(expectedCount);

      const response = await controller.getOverdueTasksCount(filters);

      expect(response.count).toEqual(expectedCount);
      expect(mockTaskService.countOverdueTasks).toHaveBeenCalledWith(filters);
    });
  });

  describe('update', () => {
    it('should update task by id, with optional address', async () => {
      const expectedResult: GetTaskDto = new GetTaskDto(
        'task1',
        'Task1',
        null,
        null,
        null,
        Sector.OPERACIONAL,
        TaskStage.SALE_COMPLETED,
        null,
        {
          id: 'user1',
          name: 'User1',
          email: 'user1@gmail.com',
        },
        {
          id: 'order1',
          code: 'Order1',
        },
        {
          zipCode: '12345-678',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua A',
          number: '123',
          complement: 'Apto 456',
        },
      );

      mockTaskService.update.mockResolvedValue(expectedResult);

      const updateTaskDto = {
        title: 'Task1',
        startedAt: new Date(),
        dueDate: new Date(),
        completedAt: new Date(),
        userId: mockedUser.id,
        orderId: 'order1',
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        address: new AddressDto(), // address opcional
      };

      const response = await controller.update('task1', updateTaskDto);

      expect(response.message).toEqual('Tarefa atualizada com sucesso.');
      expect(response.task).toEqual(expectedResult);

      expect(mockTaskService.update).toHaveBeenCalledWith(
        'task1',
        updateTaskDto,
      );
    });
  });

  describe('start', () => {
    it('should start a task', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        startedAt: new Date(),
        completedAt: null,
        stage: TaskStage.SALE_COMPLETED,
        sector: Sector.OPERACIONAL,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.start.mockResolvedValue(expectedResult);

      const response = await controller.start('task1');

      expect(response.message).toEqual('Tarefa iniciada com sucesso');
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.start).toHaveBeenCalledWith('task1');
    });
  });

  describe('complete', () => {
    it('should mark a task as completed', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        startedAt: null,
        completedAt: new Date(),
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.complete.mockResolvedValue(expectedResult);

      const response = await controller.complete('task1');

      expect(response.message).toEqual(
        'Tarefa concluída com sucesso',
      );
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.complete).toHaveBeenCalledWith('task1');
    });

    it('should mark a task as not completed', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        startedAt: null,
        completedAt: null,
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.uncomplete.mockResolvedValue(expectedResult);

      const response = await controller.uncomplete('task1');

      expect(response.message).toEqual(
        'Conclusão da tarefa desfeita com sucesso',
      );
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.complete).toHaveBeenCalledWith('task1');
    });
  });

  describe('assign', () => {
    it('should assign a user to a task', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        startedAt: null,
        completedAt: null,
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.assign.mockResolvedValue(expectedResult);

      const assignUserDTO = {
        userId: 'user1'
      }

      const response = await controller.assign('task1', assignUserDTO);

      expect(mockTaskService.assign).toHaveBeenCalledWith('task1', assignUserDTO);
      expect(response.task).toEqual(expectedResult);
    });

    it('should unassign a user from a task', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        startedAt: null,
        completedAt: null,
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: {
          id: 'null',
          name: 'Nenhum usuário atribuído a esta tarefa',
          email: 'null',
        },
      };

      mockTaskService.unassign.mockResolvedValue(expectedResult);

      const response = await controller.unassign('task1');

      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.unassign).toHaveBeenCalledWith('task1');
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
  
      mockTaskService.addCost.mockResolvedValue(expectedTask);
  
      const response = await controller.addCost(taskId, cost);
  
      expect(mockTaskService.addCost).toHaveBeenCalledWith(taskId, cost);
      expect(response.task).toEqual(expectedTask);
      expect(response.message).toBe('valor atribuido a tarefa');
    });
  
    it('should throw NotFoundException when task ID is invalid', async () => {
      const taskId = 'invalidTaskId';
      const cost = 500;
  
      mockTaskService.addCost.mockRejectedValue(new NotFoundException('Task not found'));
  
      await expect(controller.addCost(taskId, cost)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockTaskService.addCost).toHaveBeenCalledWith(taskId, cost);
    });
  });
  
  describe('dueDate', () => {
    it('should update the due date of a task', async () => {
      const taskId = 'task1';
      const date = '31/12/2024';
      const parsedDueDate = new Date('2024-12-31');
      const expectedTask = {
        id: taskId,
        title: 'Task1',
        taskCost: null,
        dueDate: parsedDueDate,
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
  
      jest.spyOn(controller, 'parseBrazilianDate').mockReturnValue(parsedDueDate);
      mockTaskService.updateDueDate.mockResolvedValue(expectedTask);
  
      const response = await controller.dueDate(taskId, date);
  
      expect(controller.parseBrazilianDate).toHaveBeenCalledWith(date);
      expect(mockTaskService.updateDueDate).toHaveBeenCalledWith(taskId, parsedDueDate);
      expect(response.task).toEqual(expectedTask);
      expect(response.message).toBe('valor atribuido a tarefa');
    });
  
    it('should throw BadRequestException for invalid date format', async () => {
      const taskId = 'task1';
      const invalidDate = 'invalid-date';
  
      jest.spyOn(controller, 'parseBrazilianDate').mockReturnValue(null);
  
      await expect(controller.dueDate(taskId, invalidDate)).rejects.toBeInstanceOf(BadRequestException);
      expect(controller.parseBrazilianDate).toHaveBeenCalledWith(invalidDate);
    });
  
    it('should throw NotFoundException when task ID is invalid', async () => {
      const taskId = 'invalidTaskId';
      const date = '31/12/2024';
      const parsedDueDate = new Date('2024-12-31');
  
      jest.spyOn(controller, 'parseBrazilianDate').mockReturnValue(parsedDueDate);
      mockTaskService.updateDueDate.mockRejectedValue(new NotFoundException('Task not found'));
  
      await expect(controller.dueDate(taskId, date)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockTaskService.updateDueDate).toHaveBeenCalledWith(taskId, parsedDueDate);
    });
  });
  

  describe('remove', () => {
    it('should remove task by id', async () => {
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        startedAt: null,
        completedAt: null,
        sector: Sector.OPERACIONAL,
        stage: TaskStage.SALE_COMPLETED,
        taskCost: null,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser,
      };

      mockTaskService.remove.mockResolvedValue(expectedResult);

      const response = await controller.remove('task1');

      expect(response.message).toEqual('Tarefa excluída com sucesso.');
      expect(response.task).toEqual(expectedResult);
      expect(mockTaskService.remove).toHaveBeenCalledWith('task1');
    });
  });
});
