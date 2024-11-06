import { Test, TestingModule } from '@nestjs/testing';
import { ProcessService } from './process.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Process } from 'src/modules/process/entities/process.entity';
import { Repository } from 'typeorm';

describe('ProcessService', () => {
  let service: ProcessService;
  let repo: Repository<Process>

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    leftJoinAndSelect: jest.fn().mockReturnThis()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessService,
        {
          provide: getRepositoryToken(Process),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProcessService>(ProcessService);
    repo = module.get<Repository<Process>>(getRepositoryToken(Process));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
