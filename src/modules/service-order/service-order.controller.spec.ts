import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { Status } from './enums/status.enum';
import { Sector } from './enums/sector.enum';
import { Role } from '../roles/enums/roles.enum';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;
  let service: ServiceOrderService;

  const mockServiceOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
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
    it('should create a new service order', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'Test Order',
        clientRelated: 'Client X',
        status: Status.PENDENTE,
        sector: Sector.ADMINISTRATIVO,
        userId: 'user-123',
      };

      const result = {
        id: 'order-123',
        title: 'Test Order',
        clientRelated: 'Client X',
        status: Status.PENDENTE,
        sector: Sector.ADMINISTRATIVO,
        user: {
          id: 'user-123',
          name: 'User Test',
          email: 'user@test.com',
          role : Role.EMPLOYEE
        },
      };

      mockServiceOrderService.create.mockResolvedValue(result);

      const response = await controller.create(createServiceOrderDto);

      expect(response.message).toEqual('ordem de serviço cadastrada');
      expect(response.serviceOrder).toEqual(
        new ListServiceOrderDto(
          result.id,
          result.title,
          result.clientRelated,
          result.status,
          result.sector,
          result.user
        )
      );
    });
  });

  describe('findAll', () => {
    it('should return all service orders', async () => {
      const result = [
        new ListServiceOrderDto(
          'order-123',
          'Test Order',
          'Client X',
          Status.PENDENTE,
          Sector.ADMINISTRATIVO,
          {
            id: 'user-123',
            name: 'User Test',
            email: 'user@test.com',
            role: Role.EMPLOYEE,
          }
        ),
      ];

      mockServiceOrderService.findAll.mockResolvedValue(result);

      const response = await controller.findAll();

      expect(response.message).toEqual('Ordens de serviço encontradas');
      expect(response.orders).toEqual(result);
    });

    it('should apply filters and return filtered service orders', async () => {
      const result = [
        new ListServiceOrderDto(
          'order-123',
          'Filtered Order',
          'Client X',
          Status.PENDENTE,
          Sector.ADMINISTRATIVO,
          {
            id: 'user-123',
            name: 'User Test',
            email: 'user@test.com',
            role: Role.EMPLOYEE
          }
        ),
      ];

      mockServiceOrderService.findAll.mockResolvedValue(result);

      const response = await controller.findAll('order-123', 'Filtered Order', 'Client X', 'PENDENTE');

      expect(response.orders).toEqual(result);
    });
  });

  describe('update', () => {
  it('should update the service order and return it', async () => {
    const updateServiceOrderDto: UpdateServiceOrderDto = {
      title: 'Updated Order',
      clientRelated: 'Client B',
      status: Status.FINALIZADO,
    };

    const updatedOrder = {
      id: 'uuid',
      title: 'Updated Order',
      clientRelated: 'Client B',
      status: Status.FINALIZADO,
      user: {
        id: 'user-123',
        name: 'User Test',
        email: 'user@test.com',
      },
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
      status: Status.PENDENTE,
      user: {
        id: 'user-123',
        name: 'User Test',
        email: 'user@test.com',
      },
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
