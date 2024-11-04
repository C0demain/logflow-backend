import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Process } from 'src/modules/process/entities/process.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process])
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService]
})
export class ProcessModule {}
