import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

const orders = [
  {
    id: 'order-1',
    title: 'Test Order 1',
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
    title: 'Test Order 2',
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

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repository: Repository<ServiceOrder>;

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
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repository = module.get<Repository<ServiceOrder>>(
      getRepositoryToken(ServiceOrder),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service order and tasks', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'Test Order',
        clientId: 'client-id-123',
        status: Status.PENDENTE,
        sector: Sector.OPERACIONAL,
        userId: 'user-id-123',
        description: 'anything',
        value: 100,
      };

      const userMock = {
        id: 'user-id-123',
        name: 'User Test',
        email: 'user@test.com',
        role: { name: 'EMPLOYEE' },
      };
      const clientMock = {
        id: 'client-id-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12345',
      };

      const motoristaRoleMock = { id: 'role-1', name: 'Motorista' };
      const financeiroRoleMock = {
        id: 'role-2',
        name: 'Analista Administrativo "Financeiro"',
      };
      const operacionalRoleMock = { id: 'role-3', name: 'Gerente Operacional' };

      mockUserService.findById.mockResolvedValue(userMock);
      mockClientService.findById.mockResolvedValue(clientMock);
      mockRoleRepository.findOne.mockResolvedValueOnce(motoristaRoleMock);
      mockRoleRepository.findOne.mockResolvedValueOnce(financeiroRoleMock);
      mockRoleRepository.findOne.mockResolvedValueOnce(operacionalRoleMock);

      const savedOrder = {
        id: 'order-123',
        ...createServiceOrderDto,
        client: clientMock,
        user: userMock,
      };

      mockServiceOrderRepository.save.mockResolvedValue(savedOrder);

      const result = await service.create(createServiceOrderDto);

      expect(result).toEqual(savedOrder);
      expect(mockUserService.findById).toHaveBeenCalledWith('user-id-123');
      expect(mockClientService.findById).toHaveBeenCalledWith('client-id-123');
      expect(mockServiceOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Order',
          status: Status.PENDENTE,
          sector: Sector.OPERACIONAL,
          client: clientMock,
          user: userMock,
        }),
      );

      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(mockRoleRepository.findOne).toHaveBeenCalledTimes(3);
    });
  });

  describe('findAll', () => {
    it('should return a list of service orders based on filters', async () => {
      const filters = {
        isActive: true,
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
        where: filters,
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
      expect(mockServiceOrderRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          creationDate: expect.objectContaining({
            _type: 'between',
            _value: [filters.createdFrom, filters.createdTo],
          }),
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a service order', async () => {
      const updateServiceOrderDto: UpdateServiceOrderDto = {
        title: 'Updated Order',
        status: Status.FINALIZADO,
      };
      const existingOrder = {
        id: 'order-123',
        title: 'Test Order',
        status: Status.PENDENTE,
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockServiceOrderRepository.save.mockResolvedValue({
        ...existingOrder,
        ...updateServiceOrderDto,
      });

      const result = await service.update('order-123', updateServiceOrderDto);

      expect(result.title).toEqual('Updated Order');
      expect(result.status).toEqual(Status.FINALIZADO);
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        relations: { serviceOrderLogs: true },
        where: { id: 'order-123' },
      });
      expect(mockServiceOrderRepository.save).toHaveBeenCalledWith({
        ...existingOrder,
        ...updateServiceOrderDto,
      });
    });

    it('should throw an error if order is not found', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { title: 'Updated Order' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLogs', () => {
    it('should return the service order logs', async () => {
      const log = {
        id: '1',
        changedTo: Sector.OPERACIONAL,
        creationDate: new Date(),
        serviceOrder: { id: '2' },
      } as ServiceOrderLog;

      mockServiceOrderLogRepository.find.mockResolvedValue([log]);

      const result = await service.getLogs({
        id: '1',
        serviceOrderId: '2',
        changedTo: Sector.OPERACIONAL,
      });

      expect(result).toEqual([
        {
          id: '1',
          changedTo: Sector.OPERACIONAL,
          creationDate: log.creationDate,
        },
      ]);
    });

    it('should throw an error if not found', async () => {
      mockServiceOrderLogRepository.find.mockResolvedValue([]);

      await expect(service.getLogs({})).rejects.toThrow(
        'Nenhum log de ordem de serviço encontrado.',
      );
    });
  });

  describe('remove', () => {
    it('should delete a service order', async () => {
      const orderToDelete = {
        id: 'order-123',
        title: 'Order 1',
        isActive: true,
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(orderToDelete);
      mockServiceOrderRepository.delete.mockResolvedValue({
        ...orderToDelete,
        isActive: false,
      });

      const result = await service.remove('order-123');

      expect(result.isActive).toBeFalsy();
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      });
      expect(mockServiceOrderRepository.save).toHaveBeenCalledWith(
        orderToDelete,
      );
    });

    it('should throw an error if order is not found', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
