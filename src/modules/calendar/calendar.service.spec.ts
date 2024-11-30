import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Task } from '../task/entities/task.entity';
import { ServiceOrder } from '../service-order/entities/service-order.entity';

const mockUserRepository = {
  findById: jest.fn(),
};
const mockTaskRepository = {
  findById: jest.fn(),
};
const mockServiceOrderRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: mockServiceOrderRepository,
        }
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
