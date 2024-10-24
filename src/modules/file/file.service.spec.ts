import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileService } from './file.service';
import { FileEntity } from './entities/file.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Task } from '../task/entities/task.entity';
import { Repository } from 'typeorm';

describe('FileService', () => {
  let service: FileService;
  let fileRepository: Repository<FileEntity>;
  let userRepository: Repository<UserEntity>;
  let taskRepository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: getRepositoryToken(FileEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    fileRepository = module.get<Repository<FileEntity>>(getRepositoryToken(FileEntity));
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  describe('uploadFile', () => {
    it('should upload a file and associate it with a user and task', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('file content'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const mockUser = { id: 'userId' } as UserEntity;
      const mockTask = { id: 'taskId' } as Task;

      fileRepository.create = jest.fn().mockReturnValue({
        filename: mockFile.originalname,
        data: mockFile.buffer,
        mimetype: mockFile.mimetype,
        user: undefined,
        task: undefined,  
      });
      
      fileRepository.save = jest.fn().mockResolvedValue({
        id: 'fileId',
        filename: mockFile.originalname,
        data: mockFile.buffer,
        mimetype: mockFile.mimetype,
        user: mockUser,
        task: mockTask,
      });

      userRepository.findOneBy = jest.fn().mockResolvedValue(mockUser);
      taskRepository.findOneBy = jest.fn().mockResolvedValue(mockTask);

      const result = await service.uploadFile(mockFile, 'userId', 'taskId');

      expect(result).toEqual({
        id: 'fileId',
        filename: 'test.pdf',
        data: expect.any(Buffer),
        mimetype: 'application/pdf',
        user: mockUser,
        task: mockTask,
      });
      expect(fileRepository.create).toHaveBeenCalled();
      expect(fileRepository.save).toHaveBeenCalled();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'userId' });
      expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: 'taskId' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('file content'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      fileRepository.create = jest.fn().mockReturnValue({
        filename: mockFile.originalname,
        data: mockFile.buffer,
        mimetype: mockFile.mimetype,
        user: undefined,
        task: undefined,
      });

      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.uploadFile(mockFile, 'invalidUserId')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if task is not found', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('file content'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      fileRepository.create = jest.fn().mockReturnValue({
        filename: mockFile.originalname,
        data: mockFile.buffer,
        mimetype: mockFile.mimetype,
        user: undefined,
        task: undefined,
      });

      userRepository.findOneBy = jest.fn().mockResolvedValue({ id: 'userId' } as UserEntity);
      taskRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.uploadFile(mockFile, 'userId', 'invalidTaskId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return a list of files filtered by userId and taskId', async () => {
      const mockFile = {
        id: 'fileId',
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        user: { id: 'userId' },
        task: { id: 'taskId' },
      } as FileEntity;

      jest.spyOn(fileRepository, 'find').mockResolvedValue([mockFile]);

      const result = await service.findAll({ userId: 'userId', taskId: 'taskId' });

      expect(result).toEqual([
        {
          id: 'fileId',
          name: 'test.pdf',
          fileType: 'application/pdf',
          userId: 'userId',
          taskId: 'taskId',
        },
      ]);
    });
  });

  describe('getFileByName', () => {
    it('should return a file by id', async () => {
      const mockFile = { id: 'fileId', filename: 'test.pdf' } as FileEntity;

      jest.spyOn(fileRepository, 'findOneBy').mockResolvedValue(mockFile);

      const result = await service.getFileByName('fileId');

      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException if file is not found', async () => {
      jest.spyOn(fileRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getFileByName('invalidFileId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file by id', async () => {
      const mockFile = { id: 'fileId' } as FileEntity;

      jest.spyOn(fileRepository, 'findOneBy').mockResolvedValue(mockFile);
      jest.spyOn(fileRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteFile('fileId');

      expect(result).toEqual(mockFile);
      expect(fileRepository.delete).toHaveBeenCalledWith({ id: 'fileId' });
    });

    it('should throw NotFoundException if file is not found', async () => {
      jest.spyOn(fileRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(fileRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteFile('invalidFileId')).rejects.toThrow(NotFoundException);
    });
  });
});
