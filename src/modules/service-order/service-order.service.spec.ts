import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrder } from './entities/service-order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<ServiceOrderService>(ServiceOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
