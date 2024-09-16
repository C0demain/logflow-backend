import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrder } from './entities/service-order.entity';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { Status } from './enums/status.enum';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repository: Repository<ServiceOrder>;

  const mockServiceOrderRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: mockServiceOrderRepository,
        },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repository = module.get<Repository<ServiceOrder>>(getRepositoryToken(ServiceOrder));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Teste do método create
  describe('create', () => {
    it('should create a new service order', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'New Order',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: Status.PENDENTE,
        userId: ""
      };

      const savedOrder = {
        id: 'uuid',
        ...createServiceOrderDto,
      };

      mockServiceOrderRepository.save.mockResolvedValue(savedOrder);

      const result = await service.create(createServiceOrderDto);

      expect(result).toEqual(savedOrder);
      expect(mockServiceOrderRepository.save).toHaveBeenCalledWith(expect.any(ServiceOrder));
    });
  });

  // Teste do método findAll
  describe('findAll', () => {
    it('should return an array of service orders', async () => {
      const serviceOrders = [
        {
          id: 'uuid1',
          title: 'Order 1',
          clientRelated: 'Client A',
          expirationDate: new Date('2024-12-31'),
          status: 'PENDENTE',
        },
        {
          id: 'uuid2',
          title: 'Order 2',
          clientRelated: 'Client B',
          expirationDate: new Date('2024-12-31'),
          status: 'FINALIZADO',
        },
      ];

      mockServiceOrderRepository.find.mockResolvedValue(serviceOrders);

      const result = await service.findAll();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'uuid1',
            title: 'Order 1',
            clientRelated: 'Client A',
            expirationDate: new Date('2024-12-31'),
            status: 'PENDENTE',
          }),
        ]),
      );
      expect(mockServiceOrderRepository.find).toHaveBeenCalled();
    });
  });

  // Teste do método findById
  describe('findById', () => {
    it('should return a service order when found', async () => {
      const order = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: 'PENDENTE',
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.findById('uuid');

      expect(result).toEqual(order);
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid' },
      });
    });

    it('should throw NotFoundException when no service order is found', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('uuid')).rejects.toThrow(NotFoundException);
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid' },
      });
    });
  });

  // Teste do método findByTitle
  describe('findByTitle', () => {
    it('should return a service order when found by title', async () => {
      const order = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: 'PENDENTE',
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.findByTitle('Order 1');

      expect(result).toEqual(order);
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        where: { title: 'Order 1' },
      });
    });

    it('should throw NotFoundException when no service order is found by title', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findByTitle('Order 1')).rejects.toThrow(NotFoundException);
      expect(mockServiceOrderRepository.findOne).toHaveBeenCalledWith({
        where: { title: 'Order 1' },
      });
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
        status: 'PENDENTE',
      };

      const updateServiceOrderDto: UpdateServiceOrderDto = {
        title: 'Updated Order',
        clientRelated: 'Client B',
        expirationDate: new Date('2025-12-31'),
        status: Status.FINALIZADO,
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockServiceOrderRepository.save.mockResolvedValue({
        ...existingOrder,
        ...updateServiceOrderDto,
      });

      const result = await service.update('uuid', updateServiceOrderDto);

      expect(result).toEqual({
        ...existingOrder,
        ...updateServiceOrderDto,
      });
      expect(mockServiceOrderRepository.save).toHaveBeenCalledWith({
        ...existingOrder,
        ...updateServiceOrderDto,
      });
    });

    it('should throw NotFoundException when no service order is found to update', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.update('uuid', {} as UpdateServiceOrderDto)).rejects.toThrow(NotFoundException);
    });
  });

  // Teste do método remove
  describe('remove', () => {
    it('should remove a service order and return it', async () => {
      const order = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: 'PENDENTE',
      };

      mockServiceOrderRepository.findOne.mockResolvedValue(order);
      mockServiceOrderRepository.delete.mockResolvedValue({});

      const result = await service.remove('uuid');

      expect(result).toEqual(order);
      expect(mockServiceOrderRepository.delete).toHaveBeenCalledWith(order.id);
    });

    it('should throw NotFoundException when no service order is found to delete', async () => {
      mockServiceOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
