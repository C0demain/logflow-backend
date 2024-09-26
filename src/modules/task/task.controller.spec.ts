import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { JwtService } from '@nestjs/jwt';
import { CreateTaskDto } from 'src/modules/task/dto/create-task.dto';
import { GetTaskDto } from 'src/modules/task/dto/list-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService

  const createTaskDto: CreateTaskDto = {
    title: 'Task1',
    userId: 'user1',
    orderId: 'order1'
  }

  const mockedUser = {
    id: 'user1',
    name: 'User1',
    email: 'user1@gmail.com'
  }

  const mockedServiceOrder = {
    id: 'order1',
    title: 'Order1'
  }

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
          useValue: mockTaskService
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

  describe('create', ()=>{
    it('should create a task', async ()=>{
      const expectedResult: GetTaskDto = {
        id: 'task1',
        title: 'Task1',
        completed: false,
        serviceOrder: mockedServiceOrder,
        assignedUser: mockedUser
      }
      mockTaskService.create.mockResolvedValue(expectedResult)

      const response = await controller.create(createTaskDto)

      expect(response.task).toEqual(expectedResult)
      expect(response.message).toEqual('Tarefa criada com sucesso')
      expect(mockTaskService.create).toHaveBeenCalledWith(createTaskDto)
    })
  })

  describe('findAll', ()=>{
    it('should return all tasks', async ()=>{
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
        }
      ]
      mockTaskService.findAll.mockResolvedValue(expectedResult)

      const response = await controller.findAll()

      expect(response.message).toEqual('Tarefas obtidas com sucesso')
      expect(response.tasks).toEqual(expectedResult)
      expect(mockTaskService.findAll).toHaveBeenCalledWith({})
    })

    it('should return tasks filtered by title', async ()=>{
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
        }
      ]
      mockTaskService.findAll.mockResolvedValue(expectedResult)

      const response = await controller.findAll('task1')

      expect(response.message).toEqual('Tarefas obtidas com sucesso')
      expect(response.tasks).toEqual(expectedResult)
      expect(mockTaskService.findAll).toHaveBeenCalledWith({title: 'task1'})
    })

    it('should return tasks filtered by userId', async ()=>{
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
        }
      ]
      mockTaskService.findAll.mockResolvedValue(expectedResult)

      const response = await controller.findAll(undefined, 'user1')

      expect(response.message).toEqual('Tarefas obtidas com sucesso')
      expect(response.tasks).toEqual(expectedResult)
      expect(mockTaskService.findAll).toHaveBeenCalledWith({assignedUserId: 'user1'})
    })

    it('should return tasks filtered by serviceOrderId', async ()=>{
      const expectedResult: GetTaskDto[] = [
        {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
        }
      ]
      mockTaskService.findAll.mockResolvedValue(expectedResult)

      const response = await controller.findAll(undefined, undefined, 'order1')

      expect(response.message).toEqual('Tarefas obtidas com sucesso')
      expect(response.tasks).toEqual(expectedResult)
      expect(mockTaskService.findAll).toHaveBeenCalledWith({serviceOrderId: 'order1'})
    })
  })

  describe('findById', ()=>{
    it('should return task by id', async ()=>{
      const expectedResult: GetTaskDto = {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
        }

      mockTaskService.findById.mockResolvedValue(expectedResult)

      const response = await controller.findById('task1')

      expect(response.message).toEqual('Tarefa obtida com sucesso')
      expect(response.task).toEqual(expectedResult)
      expect(mockTaskService.findById).toHaveBeenCalledWith('task1')
    })
  })

  describe('update', ()=>{
    it('should update task by id', async ()=>{
      const expectedResult: GetTaskDto = {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
      }

      mockTaskService.update.mockResolvedValue(expectedResult)

      const response = await controller.update('task1', {title: 'Task1', completed: false, userId: mockedUser.id})

      expect(response.message).toEqual('Tarefa atualizada com sucesso')
      expect(response.task).toEqual(expectedResult)
      expect(mockTaskService.update).toHaveBeenCalledWith('task1', {title: 'Task1', completed: false,userId: mockedUser.id})
    })
  })

  describe('remove', ()=>{
    it('should remove task by id', async ()=>{
      const expectedResult: GetTaskDto = {
          id: 'task1',
          title: 'Task1',
          completed: false,
          serviceOrder: mockedServiceOrder,
          assignedUser: mockedUser
        }

      mockTaskService.remove.mockResolvedValue(expectedResult)

      const response = await controller.remove('task1')

      expect(response.message).toEqual('Tarefa excluída com sucesso')
      expect(response.task).toEqual(expectedResult)
      expect(mockTaskService.remove).toHaveBeenCalledWith('task1')
    })
  })

});
