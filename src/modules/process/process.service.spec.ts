import { Test, TestingModule } from '@nestjs/testing';
import { ProcessService } from './process.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Process } from 'src/modules/process/entities/process.entity';

describe('ProcessService', () => {
  let service: ProcessService;

  const processMock: Process = {
    id: 'process-1',
    title: 'Process 1',
    tasks: [],
  }

  const mockRepository = {
    create: jest.fn().mockResolvedValue(processMock),
    save: jest.fn().mockResolvedValue(processMock),
    find: jest.fn().mockResolvedValue([processMock]),
    findOneBy: jest.fn().mockResolvedValue(processMock),
    findOne: jest.fn().mockResolvedValue(processMock),
    
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessService,
        {
          provide: getRepositoryToken(Process),
          useValue: mockRepository
        }
      ],
    }).compile();

    service = module.get<ProcessService>(ProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
