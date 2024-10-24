import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { NotFoundException } from '@nestjs/common';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;

  const mockFileService = {
    uploadFile: jest.fn(),
    findAll: jest.fn(),
    getFileByName: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockFile = {
    id: 'file-id',
    filename: 'test.txt',
    mimetype: 'text/plain',
    data: Buffer.from('file content'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          return true;
        },
      })
      .compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file and return its id and filename', async () => {
      const mockUploadedFile = { originalname: 'test.txt' } as Express.Multer.File;
      const mockSavedFile = { id: 'file-id', filename: 'test.txt' };
      mockFileService.uploadFile.mockResolvedValue(mockSavedFile);

      const result = await controller.uploadFile(mockUploadedFile, { userId: 'user-id', taskId: 'task-id' });
      expect(result).toEqual({ id: mockSavedFile.id, filename: mockSavedFile.filename });
      expect(fileService.uploadFile).toHaveBeenCalledWith(mockUploadedFile, 'user-id', 'task-id');
    });
  });

  describe('getAll', () => {
    it('should return files based on userId and taskId', async () => {
      const mockFiles = [
        { id: 'file-id1', name: 'test1.txt', fileType: 'text/plain', userId: 'user-id', taskId: 'task-id' },
        { id: 'file-id2', name: 'test2.txt', fileType: 'text/plain', userId: 'user-id', taskId: 'task-id' },
      ];

      mockFileService.findAll.mockResolvedValue(mockFiles);

      const result = await controller.getAll('user-id', 'task-id');
      expect(result).toEqual({
        message: 'Arquivos encontrados.',
        files: mockFiles,
      });
      expect(fileService.findAll).toHaveBeenCalledWith({
        userId: 'user-id',
        taskId: 'task-id',
      });
    });

    it('should return empty message when no files are found', async () => {
      mockFileService.findAll.mockResolvedValue([]);

      const result = await controller.getAll('user-id', 'task-id');
      expect(result).toEqual({
        message: 'Nenhum arquivo encontrado.',
        files: [],
      });
    });

    it('should handle errors and return error message', async () => {
      mockFileService.findAll.mockRejectedValue(new Error('some error'));

      const result = await controller.getAll('user-id', 'task-id');
      expect(result).toEqual({
        message: 'Erro ao buscar arquivos.',
        files: [],
      });
    });
  });

  describe('getFile', () => {
    it('should return the file data for a given id', async () => {
      mockFileService.getFileByName.mockResolvedValue(mockFile);
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as any;

      await controller.getFile('file-id', res);
      expect(fileService.getFileByName).toHaveBeenCalledWith('file-id');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(res.send).toHaveBeenCalledWith(mockFile.data);
    });

    it('should throw NotFoundException if file is not found', async () => {
      mockFileService.getFileByName.mockRejectedValue(new NotFoundException());

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as any;

      await expect(controller.getFile('invalid-id', res)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file and return a confirmation message', async () => {
      mockFileService.deleteFile.mockResolvedValue(mockFile);

      const result = await controller.deleteFile('file-id');
      expect(result).toEqual({ message: `Arquivo ${mockFile.filename} deletado.` });
      expect(fileService.deleteFile).toHaveBeenCalledWith('file-id');
    });

    it('should throw NotFoundException if file is not found for deletion', async () => {
      mockFileService.deleteFile.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteFile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
