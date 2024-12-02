import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: Repository<Vehicle>;

  const mockVehicleRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um novo veículo', async () => {
      const createVehicleDto: CreateVehicleDto = {
        plate: 'ABC1234', model: 'Modelo X', brand: 'Marca Y', year: 2020, autonomy: 500,
        status: ''
      };
      mockVehicleRepository.findOne.mockResolvedValue(null);
      mockVehicleRepository.create.mockReturnValue(createVehicleDto);
      mockVehicleRepository.save.mockResolvedValue(createVehicleDto);

      const result = await service.create(createVehicleDto);
      expect(result).toEqual(createVehicleDto);
      expect(mockVehicleRepository.findOne).toHaveBeenCalledWith({ where: { plate: 'ABC1234' } });
      expect(mockVehicleRepository.save).toHaveBeenCalledWith(createVehicleDto);
    });

    it('deve lançar erro ao tentar criar veículo com placa duplicada', async () => {
      const createVehicleDto: CreateVehicleDto = {
        plate: 'ABC1234', model: 'Modelo X', brand: 'Marca Y', year: 2020, autonomy: 500,
        status: ''
      };
      mockVehicleRepository.findOne.mockResolvedValue(createVehicleDto);

      await expect(service.create(createVehicleDto)).rejects.toThrow(BadRequestException);
      expect(mockVehicleRepository.findOne).toHaveBeenCalledWith({ where: { plate: 'ABC1234' } });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de veículos', async () => {
      const filter: FilterVehicleDto = {};
      const vehicles = [{ id: '1', plate: 'ABC1234' }];
      mockVehicleRepository.find.mockResolvedValue(vehicles);

      const result = await service.findAll(filter);
      expect(result).toEqual(vehicles);
      expect(mockVehicleRepository.find).toHaveBeenCalled();
    });

    it('deve lançar erro quando nenhum veículo é encontrado', async () => {
      mockVehicleRepository.find.mockResolvedValue([]);

      await expect(service.findAll({})).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um veículo existente', async () => {
      const updateVehicleDto: UpdateVehicleDto = { model: 'Modelo Z' };
      const vehicle = { id: '1', model: 'Modelo X' };
      mockVehicleRepository.findOne.mockResolvedValue(vehicle);
      mockVehicleRepository.update.mockResolvedValue(undefined);

      await service.update('1', updateVehicleDto);
      expect(mockVehicleRepository.update).toHaveBeenCalledWith('1', updateVehicleDto);
    });

    it('deve lançar erro ao tentar atualizar veículo não existente', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', {} as UpdateVehicleDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('deve retornar veículo pelo ID', async () => {
      const vehicle = { id: '1', plate: 'ABC1234' };
      mockVehicleRepository.findOne.mockResolvedValue(vehicle);

      const result = await service.findById('1');
      expect(result).toEqual(vehicle);
      expect(mockVehicleRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('deve lançar erro ao não encontrar veículo pelo ID', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status do veículo', async () => {
      const vehicle = { id: '1', plate: 'ABC1234', status: 'ativo' };
      mockVehicleRepository.findOne.mockResolvedValue(vehicle);
      mockVehicleRepository.save.mockResolvedValue({ ...vehicle, status: 'inativo' });

      const result = await service.updateStatus('1', 'inativo');
      expect(result.status).toBe('inativo');
    });
  });

  describe('delete', () => {
    it('deve deletar veículo pelo ID', async () => {
      const vehicle = { id: '1', plate: 'ABC1234' };
      mockVehicleRepository.findOne.mockResolvedValue(vehicle);
      mockVehicleRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');
      expect(mockVehicleRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro ao tentar deletar veículo não existente', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
