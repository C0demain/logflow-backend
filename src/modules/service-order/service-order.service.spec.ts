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

const mockServiceOrderRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
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
    it('should create a new service order', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'Test Order',
        clientId: 'client-id-123',
        status: Status.PENDENTE,
        sector: Sector.ADMINISTRATIVO,
        userId: 'user-id-123',
      };

      const userMock = {
        id: 'user-id-123',
        name: 'User Test',
        email: 'user@test.com',
        role: 'EMPLOYEE',
      };
      const clientMock = {
        id: 'client-id-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12345',
      };

      mockUserService.findById.mockResolvedValue(userMock);
      mockClientService.findById.mockResolvedValue(clientMock);

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
          sector: Sector.ADMINISTRATIVO,
          client: clientMock,
          user: userMock,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of service orders based on filters', async () => {
      const filters = {
        isActive: true,
        status: Status.PENDENTE,
        sector: Sector.ADMINISTRATIVO,
      };
      const orders = [
        {
          id: 'order-123',
          title: 'Test Order',
          status: Status.PENDENTE,
          sector: Sector.ADMINISTRATIVO,
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
        },
      ];

      mockServiceOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(filters);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('order-123');
      expect(mockServiceOrderRepository.find).toHaveBeenCalledWith({
        where: filters,
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
