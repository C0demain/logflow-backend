import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { Status } from './enums/status.enum';
import { Sector } from './enums/sector.enum';
import { Role } from '../roles/enums/roles.enum';
import { AuthenticationGuard } from '../auth/authentication.guard';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;

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
    })
    .overrideGuard(AuthenticationGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ServiceOrderController>(ServiceOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service order', async () => {
      const createServiceOrderDto: CreateServiceOrderDto = {
        title: 'Test Order',
        clientId: 'Client X',
        status: Status.PENDENTE,
        sector: Sector.OPERACIONAL,
        userId: 'user-123',
      };

      const result = {
        id: 'order-123',
        title: 'Test Order',
        client: {
          name: 'Client X',
          email: 'client@gmail.com',
          cnpj: '12345',
        },
        status: Status.PENDENTE,
        sector: Sector.OPERACIONAL,
        user: {
          id: 'user-123',
          name: 'User Test',
          email: 'user@test.com',
          role: Role.EMPLOYEE,
        },
      };

      mockServiceOrderService.create.mockResolvedValue(result);

      const response = await controller.create(createServiceOrderDto);

      expect(response.message).toEqual('ordem de serviço cadastrada');
      expect(response.serviceOrder).toEqual(
        new ListServiceOrderDto(
          result.id,
          result.title,
          {
            clientName: result.client.name,
            clientEmail: result.client.email,
            clientCnpj: result.client.cnpj,
          },
          result.status,
          result.sector,
          {
            userId: result.user.id,
            userName: result.user.name,
            userEmail: result.user.email,
            userRole: result.user.role,
          }
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all service orders', async () => {
      const result = [
        new ListServiceOrderDto(
          'order-123',
          'Filtered Order',
          {
            clientName: 'Client X',
            clientEmail: 'client@gmail.com',
            clientCnpj: '12345',
          },
          Status.PENDENTE,
          Sector.OPERACIONAL,
          {
            userId: 'user-123', 
            userName: 'User Test',
            userEmail: 'user@test.com',
            userRole: Role.EMPLOYEE,
          },
        ),
      ];

      mockServiceOrderService.findAll.mockResolvedValue(result);

      const response = await controller.findAllOrders();

      expect(response.message).toEqual('Ordens de serviço encontradas');
      expect(response.orders).toEqual(result);
    });

    it('should apply filters and return filtered service orders', async () => {
      const result = [
        new ListServiceOrderDto(
          'order-123',
          'Filtered Order',
          {
            clientName: 'Client X',
            clientEmail: 'client@gmail.com',
            clientCnpj: '12345',
          },
          Status.PENDENTE,
          Sector.OPERACIONAL,
          {
            userId: 'user-123', 
            userName: 'User Test',
            userEmail: 'user@test.com',
            userRole: Role.EMPLOYEE,
          },
        ),
      ];

      mockServiceOrderService.findAll.mockResolvedValue(result);

      const response = await controller.findAllOrders('order-123', 'Filtered Order', 'PENDENTE');

      expect(response.orders).toEqual(result);
    });

    it('should return a message when no service orders are found', async () => {
      mockServiceOrderService.findAll.mockResolvedValue([]);

      const response = await controller.findAllOrders();

      expect(response.message).toEqual('Nenhuma ordem de serviço encontrada');
      expect(response.orders).toEqual([]);
    });
  });

  describe('findOrdersBySector', () => {
    it('should return orders by sector', async () => {
      const sector = Sector.OPERACIONAL;
      const result = [
        new ListServiceOrderDto(
          'order-123',
          'Filtered Order',
          {
            clientName: 'Client X',
            clientEmail: 'client@gmail.com',
            clientCnpj: '12345',
          },
          Status.PENDENTE,
          Sector.OPERACIONAL,
          {
            userId: 'user-123', 
            userName: 'User Test',
            userEmail: 'user@test.com',
            userRole: Role.EMPLOYEE,
          },
        ),
      ];

      mockServiceOrderService.findAll.mockResolvedValue(result);

      const response = await controller.findOrdersBySector(sector);

      expect(response.message).toEqual(`Ordens de serviço do setor ${sector} encontradas`);
      expect(response.orders).toEqual(result);
    });

    it('should return a message when no orders are found for the sector', async () => {
      const sector = 'INEXISTENTE';

      mockServiceOrderService.findAll.mockResolvedValue([]);

      const response = await controller.findOrdersBySector(sector);

      expect(response.message).toEqual(`Nenhuma ordem de serviço encontrada para o setor: ${sector}`);
      expect(response.orders).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update the service order and return it', async () => {
      const updateServiceOrderDto: UpdateServiceOrderDto = {
        title: 'Updated Order',
        clientId: 'Client B',
        status: Status.FINALIZADO,
      };

      const updatedOrder = {
        id: 'uuid',
        title: 'Updated Order',
        client: {
          clientName: 'Client X',
          clientEmail: 'client@gmail.com',
          clientCnpj: '12345',
        },
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
        client: {
          clientName: 'Client X',
          clientEmail: 'client@gmail.com',
          clientCnpj: '12345',
        },
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
