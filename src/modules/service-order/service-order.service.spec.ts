import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderService } from './service-order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { Status } from './enums/status.enum';
import { Sector } from './enums/sector.enum';
import { Task } from '../task/entities/task.entity';
import { RoleEntity } from '../roles/roles.entity';

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

const mockUserService = {
  findById: jest.fn(),
};

const mockClientService = {
  findById: jest.fn(),
};

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
        value: 100
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
      const financeiroRoleMock = { id: 'role-2', name: 'Analista Administrativo "Financeiro"' };
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
      const orders = [
        {
          id: 'order-123',
          title: 'Test Order',
          status: Status.PENDENTE,
          sector: Sector.OPERACIONAL,
          client: {
            name: 'Client X',
            email: 'client@gmail.com',
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
        },
      ];

      mockServiceOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(filters);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('order-123');
      expect(mockServiceOrderRepository.find).toHaveBeenCalledWith({
        where: filters,
        relations: {
          serviceOrderLogs: true,
        },
      });
    });

    it('should throw an error if no orders are found', async () => {
      mockServiceOrderRepository.find.mockResolvedValue([]);

      await expect(service.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );
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
