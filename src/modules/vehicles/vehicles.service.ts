import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto){
    const existingVehicle = await this.vehicleRepository.findOne({ where: { plate: createVehicleDto.plate } });
    if (existingVehicle) {
      throw new BadRequestException(`Veículo com a placa ${createVehicleDto.plate} já existe.`);
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(filters: FilterVehicleDto){
    const where: FindOptionsWhere<Vehicle> = {};

    if (filters.plate) {
      where.plate = filters.plate;
    }

    if (filters.model) {
      where.model = filters.model;
    }

    if (filters.brand) {
      where.brand = filters.brand;
    }

    if (filters.yearFrom && filters.yearTo) {
      where.year = Between(filters.yearFrom, filters.yearTo);
    } else if (filters.yearFrom) {
      where.year = MoreThanOrEqual(filters.yearFrom);
    } else if (filters.yearTo) {
      where.year = LessThanOrEqual(filters.yearTo);
    }

    if (filters.autonomyFrom && filters.autonomyTo) {
      where.autonomy = Between(filters.autonomyFrom, filters.autonomyTo);
    } else if (filters.autonomyFrom) {
      where.autonomy = MoreThanOrEqual(filters.autonomyFrom);
    } else if (filters.autonomyTo) {
      where.autonomy = LessThanOrEqual(filters.autonomyTo);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const vehicles = await this.vehicleRepository.find({ where, order: { createdAt: 'ASC' } });

    if (!vehicles.length) {
      throw new NotFoundException('Nenhum veículo encontrado com os filtros aplicados.');
    }

    return vehicles;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto){
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado.`);
    }

    await this.vehicleRepository.update(id, updateVehicleDto);
    return this.vehicleRepository.findOne({ where: { id } });
  }

  async findById(id: string){
    const vehicle = await this.vehicleRepository.findOne({where: {id}});
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado.`);
    }
    return vehicle;
  }

  async updateStatus(id: string, status: string){
    const vehicle = await this.findById(id);
    vehicle.status = status;
    return this.vehicleRepository.save(vehicle);
  }

  async delete(id: string){
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado.`);
    }

    await this.vehicleRepository.delete(id);
  }
}
