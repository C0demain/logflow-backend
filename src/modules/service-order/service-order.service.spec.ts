import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ClientService } from '../client/client.service';
import { RoleEntity } from '../roles/roles.entity';
import { Task } from '../task/entities/task.entity';
import { UserService } from '../user/user.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrderLog } from './entities/service-order-log.entity';
import { ServiceOrder } from './entities/service-order.entity';
import { Sector } from './enums/sector.enum';
import { Status } from './enums/status.enum';
import { ServiceOrderService } from './service-order.service';
import { Process } from '../process/entities/process.entity';
import { ProcessService } from '../process/process.service';

const mockServiceOrderRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

const mockTaskRepository = {
  save: jest.fn(),
};

const mockRoleRepository = {
  findOne: jest.fn(),
};

const mockServiceOrderLogRepository = {
  find: jest.fn(),
};

const mockUserService = {
  findById: jest.fn(),
};

const mockClientService = {
  findById: jest.fn(),
};

const mockProcessService = {
  findById: jest.fn(),
};

const orders = [
  {
    id: 'order-1',
    code: 'Test Order 1',
    status: Status.PENDENTE,
    sector: Sector.OPERACIONAL,
    client: {
      name: 'Client X',
      email: 'clientX@gmail.com',
      cnpj: '12345',
    },
    user: {
      id: 'user-id-123',
      name: 'User Test',
      email: 'user@test.com',
      role: 'EMPLOYEE',
    },
    serviceOrderLogs: [
      {
        changedTo: Sector.OPERACIONAL,
        atDate: new Date(),
      },
    ],
    creationDate: new Date(2024, 9, 10),
  },
  {
    id: 'order-2',
    code: 'Test Order 2',
    status: Status.PENDENTE,
    sector: Sector.FINANCEIRO,
    client: {
      name: 'Client Y',
      email: 'clientY@gmail.com',
      cnpj: '54321',
    },
    user: {
      id: 'user-id-123',
      name: 'User Test',
      email: 'user@test.com',
      role: 'EMPLOYEE',
    },
    serviceOrderLogs: [
      {
        changedTo: Sector.OPERACIONAL,
        atDate: new Date(),
      },
    ],
    creationDate: new Date(2024, 10, 11),
  },
];

const processMock: Process = {
  id: 'process-1',
  title: 'Process 1',
  tasks: [],
};

const mockProcessRepository = {
  create: jest.fn().mockResolvedValue(processMock),
  save: jest.fn().mockResolvedValue(processMock),
  find: jest.fn().mockResolvedValue([processMock]),
  findOneBy: jest.fn().mockResolvedValue(processMock),
  findOne: jest.fn().mockResolvedValue(processMock),
};

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repository: Repository<ServiceOrder>;
  let processRepo: Repository<Process>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: mockServiceOrderRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Process),
          useValue: mockProcessRepository,
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(ServiceOrderLog),
          useValue: mockServiceOrderLogRepository,
        },
        {
          provide: ClientService,
          useValue: mockClientService,
        },
        {
          provide: ProcessService,
          useValue: mockProcessService,
        },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repository = module.get<Repository<ServiceOrder>>(
      getRepositoryToken(ServiceOrder),
    );
    processRepo = module.get<Repository<Process>>(getRepositoryToken(Process));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of service orders based on filters', async () => {
      const filters = {
        status: Status.PENDENTE,
        sector: Sector.OPERACIONAL,
      };

      mockServiceOrderRepository.find.mockResolvedValue(
        orders.filter(
          (order) =>
            order.status === filters.status && order.sector === filters.sector,
        ),
      );

      const result = await service.findAll(filters);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('order-1');
      expect(mockServiceOrderRepository.find).toHaveBeenCalledWith({
        where: {
          ...filters,
          deactivatedAt: IsNull(), // Adicionando o operador esperado
        },
      });
    });


    it('should return service orders based on date filters', async () => {
      const filters = {
        createdFrom: new Date(2024, 9, 9),
        createdTo: new Date(2024, 9, 11),
      };

      mockServiceOrderRepository.find.mockResolvedValue(
        orders.filter(
          (order) =>
            order.creationDate >= filters.createdFrom &&
            order.creationDate <= filters.createdTo,
        ),
      );

      const result = await service.findAll(filters);

      expect(result.length).toEqual(1);
      expect(result[0].creationDate!.getTime()).toBeGreaterThanOrEqual(
        filters.createdFrom.getTime(),
      );
    });
  });

  describe('update', () => {
    it('should update a service order', async () => {
      const updateServiceOrderDto: UpdateServiceOrderDto = {
        description: 'Updated Order',
        status: Status.FINALIZADO,
      };
      const existingOrder = {
        id: 'order-123',
        code: 'Test Order',
        status: Status.PENDENTE,
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockServiceOrderRepository.save.mockResolvedValue({
        ...existingOrder,
        ...updateServiceOrderDto,
      });

      const result = await service.update('order-123', updateServiceOrderDto);

      expect(result.description).toEqual('Updated Order');
      expect(result.status).toEqual(Status.FINALIZADO);
    });

    it('should throw an error if order is not found', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { description: 'Updated Order' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLogs', () => {
    it('should return the service order logs', async () => {
      const log = {
        id: '1',
        action: 'action',
        creationDate: new Date(),
      }

      mockServiceOrderLogRepository.find.mockResolvedValue([log]);

      const result = await service.getLogs({
        id: '1',
        serviceOrderId: '2'
      });

      expect(result).toEqual([
        {
          id: '1',
          action: 'action',
          creationDate: log.creationDate,
        },
      ]);
    });

  });

  describe('remove', () => {
    it('should deactivate a service order', async () => {
      const orderToDeactivate = {
        id: 'order-123',
        code: 'Order 1',
      };
  
      const deactivatedOrder = {
        ...orderToDeactivate,
        deactivatedAt: new Date(),
      };
  
      mockServiceOrderRepository.findOne.mockResolvedValue(orderToDeactivate);
      mockServiceOrderRepository.save.mockResolvedValue(deactivatedOrder);
  
      const result = await service.remove('order-123');
  
      // Verifica se a entidade foi desativada com uma data válida
      expect(result.deactivatedAt).toBeTruthy();
      expect(result.deactivatedAt).toBeInstanceOf(Date);
  
      // Verifica chamadas do repositório
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      });
      expect(mockServiceOrderRepository.save).toHaveBeenCalledWith({
        ...orderToDeactivate,
        deactivatedAt: expect.any(Date),
      });
    });
  
    it('should throw an error if order is not found', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);
  
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  
});