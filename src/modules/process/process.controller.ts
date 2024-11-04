import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';

@Controller('api/v1/process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  async create(@Body() createProcessDto: CreateProcessDto) {
    const process = await this.processService.create(createProcessDto);
    return {
      message: 'Successfully created process',
      process
    }
  }

  @Get()
  async findAll() {
    const processes = await this.processService.findAll();
    return {
      message: 'Successfully fetched processes',
      processes
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const process = await this.processService.findById(id);
    return {
      message: 'Successfully fetched process',
      process
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProcessDto: UpdateProcessDto) {
    const process = await this.processService.update(id, updateProcessDto);
    return {
      message: 'Successfully updated process',
      process
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.processService.remove(id);
    return {
      message: 'Successfully deleted process'
    }
  }
}
