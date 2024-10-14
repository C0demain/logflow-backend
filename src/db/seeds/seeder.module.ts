import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { RoleEntity } from 'src/modules/roles/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity,RoleEntity])],
  providers: [SeederService, HashPasswordPipe],
  exports: [SeederService]
})
export class SeederModule {}
