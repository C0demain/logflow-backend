import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { Status } from './enums/status.enum';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;
  let service: ServiceOrderService;

  const mockServiceOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByTitle: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: mockServiceOrderService,
        },
      ],
    }).compile();

    controller = module.get<ServiceOrderController>(ServiceOrderController);
    service = module.get<ServiceOrderService>(ServiceOrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service order and return it', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'New Order',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: Status.PENDENTE,
      };

      const createdOrder = {
        id: 'uuid',
        title: 'New Order',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: Status.PENDENTE,
      };

      mockServiceOrderService.create.mockResolvedValue(createdOrder);

      const result = await controller.create(createServiceOrderDto);

      expect(result).toEqual({
        message: 'ordem de serviço cadastrada',
        serviceOrder: new ListServiceOrderDto(
          createdOrder.id,
          createdOrder.title,
          createdOrder.clientRelated,
          createdOrder.expirationDate,
          createdOrder.status,
        ),
      });
      expect(mockServiceOrderService.create).toHaveBeenCalledWith(createServiceOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return all service orders', async () => {
      const ordersList = [
        new ListServiceOrderDto('uuid1', 'Order 1', 'Client A', new Date('2024-12-31'), Status.PENDENTE),
        new ListServiceOrderDto('uuid2', 'Order 2', 'Client B', new Date('2024-12-31'), Status.FINALIZADO),
      ];

      mockServiceOrderService.findAll.mockResolvedValue(ordersList);

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'Ordens de serviço encontradas',
        orders: ordersList,
      });
      expect(mockServiceOrderService.findAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when no orders are found', async () => {
      mockServiceOrderService.findAll.mockResolvedValue(null);

      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findById', () => {
    it('should return the service order by id', async () => {
      const order = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: 'PENDENTE',
      };

      mockServiceOrderService.findById.mockResolvedValue(order);

      const result = await controller.findById('uuid');

      expect(result).toEqual({
        message: 'ordem de serviço com id: uuid encontrada',
        serviceOrder: order,
      });
      expect(mockServiceOrderService.findById).toHaveBeenCalledWith('uuid');
    });
  });

  describe('update', () => {
    it('should update the service order and return it', async () => {
      const updateServiceOrderDto: UpdateServiceOrderDto = {
        title: 'Updated Order',
        clientRelated: 'Client B',
        expirationDate: new Date('2024-12-31'),
        status: Status.FINALIZADO,
      };

      const updatedOrder = {
        id: 'uuid',
        title: 'Updated Order',
        clientRelated: 'Client B',
        expirationDate: new Date('2024-12-31'),
        status: 'CONCLUIDO',
      };

      mockServiceOrderService.update.mockResolvedValue(updatedOrder);

      const result = await controller.update('uuid', updateServiceOrderDto);

      expect(result).toEqual({
        message: 'ordem de serviço atualizada',
        serviceOrder: updatedOrder,
      });
      expect(mockServiceOrderService.update).toHaveBeenCalledWith('uuid', updateServiceOrderDto);
    });
  });

  describe('remove', () => {
    it('should delete the service order and return it', async () => {
      const orderToRemove = {
        id: 'uuid',
        title: 'Order 1',
        clientRelated: 'Client A',
        expirationDate: new Date('2024-12-31'),
        status: 'PENDENTE',
      };

      mockServiceOrderService.remove.mockResolvedValue(orderToRemove);

      const result = await controller.remove('uuid');

      expect(result).toEqual({
        message: 'ordem de serviço deletada',
        serviceOrder: orderToRemove,
      });
      expect(mockServiceOrderService.remove).toHaveBeenCalledWith('uuid');
    });
  });
});
