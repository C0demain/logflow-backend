import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { mock } from 'node:test';
import { AuthenticationGuard } from '../auth/authentication.guard';

const mockCalendarService = {
  getEvents: jest.fn(),
  addEvent: jest.fn(),
  addTaskAsEvent: jest.fn(),
  handleOAuthCallback: jest.fn(),
};

describe('CalendarController', () => {
  let controller: CalendarController;
  let service: CalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
