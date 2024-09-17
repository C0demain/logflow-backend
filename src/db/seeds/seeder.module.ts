import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UserEntity } from 'src/modules/user/user.entity';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [SeederService, HashPasswordPipe],
  exports: [SeederService]
})
export class SeederModule {}
