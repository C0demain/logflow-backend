import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { RoleEntity } from 'src/modules/roles/roles.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { Process } from 'src/modules/process/entities/process.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity,RoleEntity, Task, Process]),
    
],
  providers: [SeederService, HashPasswordPipe],
  exports: [SeederService]
})
export class SeederModule {}
