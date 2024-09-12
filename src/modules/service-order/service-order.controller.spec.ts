import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        ServiceOrderService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: {
            save: jest.fn().mockResolvedValue(ServiceOrder),
            find: jest.fn().mockResolvedValue([ServiceOrder])
          }
        }
      ],
    }).compile();

    controller = module.get<ServiceOrderController>(ServiceOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
