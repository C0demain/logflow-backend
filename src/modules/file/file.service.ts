import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity'; 
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  async uploadFile(file: Express.Multer.File, userId?: string, taskId?:string): Promise<FileEntity> {
    const newFile = await this.fileRepository.create({
      filename: file.originalname,
      data: file.buffer,
      mimetype: file.mimetype,
    });

    if(userId){
    const user = await this.userRepository.findOneBy({id:userId});
    if(!user){
      throw new NotFoundException("usuario não encontrado");
    }
    newFile.user = user;
    }

    if(taskId){
      const task = await this.taskRepository.findOneBy({id:taskId});
      if(!task){
        throw new NotFoundException("tarefa nao encontrada");
      }
      newFile.task = task;
    }

    return this.fileRepository.save(newFile);
  }

  async findAll(filters: { userId?: string; taskId?: string }) {
    const files = await this.fileRepository.find({
      where: {
        user: { id: filters.userId },
        task: { id: filters.taskId },
      },
      relations: ['user', 'task'],
    });

    return files.map(file => ({
      id: file.id,
      name: file.filename,
      fileType: file.mimetype,         
      userId: file.user?.id,     
      taskId: file.task?.id, 
    }));
  }

  async getFileByName(id: string): Promise<FileEntity> {
    const file = await this.fileRepository.findOneBy({id});
    if (!file) {
      throw new NotFoundException(`arquivo com id ${id} nao encontrado`);
    }
    return file;
  }



  async deleteFile(id: string){
    const arquivo = await this.fileRepository.findOneBy({id})
    const result = await this.fileRepository.delete({id});
    if (result.affected === 0) {
      throw new NotFoundException(`arquivo com id${id} não econtrado`);
    }
    return arquivo;
  }
}
