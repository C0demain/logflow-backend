import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrder } from './entities/service-order.entity';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { Status } from './enums/status.enum';
import { UserService } from '../user/user.service';
import { ListServiceOrderDto } from './dto/list-service-order.dto';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repo: Repository<ServiceOrder>;
  let userService: UserService;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repo = module.get<Repository<ServiceOrder>>(getRepositoryToken(ServiceOrder));
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a new service order', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'Test Order',
        clientRelated: 'Client X',
        expirationDate: new Date('2024-10-10'),
        status: Status.PENDENTE,
        userId: 'user-123',
      };

      const user = {
        id: 'user-123',
        name: 'User Test',
        email: 'user@test.com',
      };

      const result = {
        id: 'order-123',
        ...createServiceOrderDto,
        user,
      };

      mockUserService.findById.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(result);

      const createdOrder = await service.create(createServiceOrderDto);

      expect(createdOrder).toEqual(result);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Order',
        clientRelated: 'Client X',
        expirationDate: expect.any(Date),
        status: Status.PENDENTE,
        user,
      }));
    });
  });

  describe('findAll', () => {
    it('should return all service orders without filters', async () => {
      const result = [
        {
          id: 'order-123',
          title: 'Test Order',
          clientRelated: 'Client X',
          expirationDate: new Date('2024-10-10'),
          status: Status.PENDENTE,
          user: {
            id: 'user-123',
            name: 'User Test',
            email: 'user@test.com',
          },
        },
      ];

      mockRepository.find.mockResolvedValue(result);

      const orders = await service.findAll({});

      expect(orders).toEqual([
        new ListServiceOrderDto(
          'order-123',
          'Test Order',
          'Client X',
          new Date('2024-10-10'),
          Status.PENDENTE,
          {
            id: 'user-123',
            name: 'User Test',
            email: 'user@test.com',
          },
        ),
      ]);
    });

    it('should return filtered service orders', async () => {
      const result = [
        {
          id: 'order-123',
          title: 'Filtered Order',
          clientRelated: 'Client X',
          expirationDate: new Date('2024-10-10'),
          status: Status.PENDENTE,
          user: {
            id: 'user-123',
            name: 'User Test',
            email: 'user@test.com',
          },
        },
      ];

      mockRepository.find.mockResolvedValue(result);

      const orders = await service.findAll({ title: 'Filtered Order' });

      expect(orders).toEqual([
        new ListServiceOrderDto(
          'order-123',
          'Filtered Order',
          'Client X',
          new Date('2024-10-10'),
          Status.PENDENTE,
          {
            id: 'user-123',
            name: 'User Test',
            email: 'user@test.com',
          },
        ),
      ]);
    });
  });

  // Teste do método update
  describe('update', () => {
    it('should update a service order and return it', async () => {
      const existingOrder = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: Status.PENDENTE,
        user: {
          id: 'user-123',
          name: 'User Test',
          email: 'user@test.com',
        },
      };
  
      const updateServiceOrderDto: UpdateServiceOrderDto = {
        title: 'Updated Order',
        clientRelated: 'Client B',
        expirationDate: new Date('2025-12-31'),
        status: Status.FINALIZADO,
      };
  
      mockRepository.findOne.mockResolvedValue(existingOrder);
      mockRepository.save.mockResolvedValue({
        ...existingOrder,
        ...updateServiceOrderDto,
      });
  
      const result = await service.update('uuid', updateServiceOrderDto);
  
      expect(result).toEqual({
        ...existingOrder,
        ...updateServiceOrderDto,
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingOrder,
        ...updateServiceOrderDto,
      });
    });
  
    it('should throw NotFoundException when no service order is found to update', async () => {
      mockRepository.findOne.mockResolvedValue(null);
  
      await expect(service.update('uuid', {} as UpdateServiceOrderDto)).rejects.toThrow(NotFoundException);
    });
  });
  

  describe('remove', () => {
    it('should remove a service order and return it', async () => {
      const order = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: 'PENDENTE',
      };
  
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.delete.mockResolvedValue({});
  
      const result = await service.remove('uuid');
  
      expect(result).toEqual(order);
      // Aqui a correção, passando apenas o ID
      expect(mockRepository.delete).toHaveBeenCalledWith(order.id);
    });
  
    it('should throw NotFoundException when no service order is found to delete', async () => {
      mockRepository.findOne.mockResolvedValue(null);
  
      await expect(service.remove('uuid')).rejects.toThrow(NotFoundException);
    });
  });
  
});
