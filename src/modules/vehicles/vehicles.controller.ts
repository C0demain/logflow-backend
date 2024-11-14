import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/authentication.guard';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';

@Controller('/api/v1/vehicles')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@ApiTags('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar veículo' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    const vehicle = await this.vehicleService.create(createVehicleDto);
    return {
      message: 'Veículo criado com sucesso.',
      vehicle,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos' })
  @ApiQuery({ name: 'plate', required: false })
  @ApiQuery({ name: 'model', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'yearFrom', required: false })
  @ApiQuery({ name: 'yearTo', required: false })
  @ApiQuery({ name: 'autonomyFrom', required: false })
  @ApiQuery({ name: 'autonomyTo', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query() filters: FilterVehicleDto) {
    const vehicles = await this.vehicleService.findAll(filters);
    return {
      message: 'Veículos obtidos com sucesso.',
      vehicles,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retornar um veículo de acordo com o ID' })
  async findById(@Param('id') id: string) {
    const vehicle = await this.vehicleService.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado.`);
    }
    return {
      message: 'Veículo obtido com sucesso.',
      vehicle,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um veículo' })
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehicleService.update(id, updateVehicleDto);
    return {
      message: 'Veículo atualizado com sucesso.',
      vehicle,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status de um veículo' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const vehicle = await this.vehicleService.updateStatus(id, status);
    return {
      message: 'Status do veículo atualizado com sucesso.',
      vehicle,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um veículo' })
  async remove(@Param('id') id: string) {
    await this.vehicleService.delete(id);
    return {
      message: 'Veículo excluído com sucesso.',
    };
  }
}
