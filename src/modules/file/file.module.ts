import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Task } from '../task/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, UserEntity, Task])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
