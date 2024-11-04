import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { Process } from 'src/modules/process/entities/process.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>
  ){}


  async create(createProcessDto: CreateProcessDto) {
    const process = await this.processRepository.save(createProcessDto)

    return process
  }

  async findAll() {
    return await this.processRepository.find()
  }

  async findById(id: string) {
    const process = await this.processRepository.findOneBy({ id })
    if(!process){
      throw new NotFoundException(`Process with id ${id} not found`)
    }

    return process
  }

  async update(id: string, updateProcessDto: UpdateProcessDto) {
    const process = await this.processRepository.findOneBy({ id })
    if(!process){
      throw new NotFoundException(`Process with id ${id} not found`)
    }

    Object.assign(process, updateProcessDto)
    await this.processRepository.save(process)

    return process
  }

  async remove(id: string) {
    const process = await this.processRepository.findOneBy({ id })
    if(!process){
      throw new NotFoundException(`Process with id ${id} not found`)
    }

    await this.processRepository.remove(process)
  }
}
