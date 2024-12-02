import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';
import { AuthenticationGuard } from '../auth/authentication.guard';

describe('VehicleController', () => {
  let controller: VehicleController;
  let service: VehiclesService;

  const mockVehiclesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<VehicleController>(VehicleController);
    service = module.get<VehiclesService>(VehiclesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('create', () => {
    it('deve criar um novo veículo e retornar uma mensagem de sucesso', async () => {
      const createVehicleDto: CreateVehicleDto = {
        plate: 'ABC1234', model: 'Modelo X', brand: 'Marca Y', year: 2020, autonomy: 500,
        status: ''
      };
      const createdVehicle = { ...createVehicleDto, id: '1' };
      mockVehiclesService.create.mockResolvedValue(createdVehicle);

      const result = await controller.create(createVehicleDto);
      expect(result).toEqual({
        message: 'Veículo criado com sucesso.',
        vehicle: createdVehicle,
      });
    });

    it('deve lançar erro ao tentar criar veículo com dados inválidos', async () => {
      mockVehiclesService.create.mockRejectedValue(new BadRequestException('Erro ao criar veículo'));

      await expect(controller.create({} as CreateVehicleDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os veículos de acordo com os filtros', async () => {
      const filter: FilterVehicleDto = { plate: 'ABC1234' };
      const vehicles = [{ id: '1', plate: 'ABC1234' }];
      mockVehiclesService.findAll.mockResolvedValue(vehicles);

      const result = await controller.findAll(filter);
      expect(result).toEqual({
        message: 'Veículos obtidos com sucesso.',
        vehicles,
      });
    });

    it('deve lançar erro ao não encontrar veículos', async () => {
      mockVehiclesService.findAll.mockRejectedValue(new NotFoundException('Nenhum veículo encontrado'));

      await expect(controller.findAll({})).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('deve retornar o veículo pelo ID', async () => {
      const vehicle = { id: '1', plate: 'ABC1234' };
      mockVehiclesService.findById.mockResolvedValue(vehicle);

      const result = await controller.findById('1');
      expect(result).toEqual({
        message: 'Veículo obtido com sucesso.',
        vehicle,
      });
    });

    it('deve lançar erro ao não encontrar veículo pelo ID', async () => {
      mockVehiclesService.findById.mockRejectedValue(new NotFoundException('Veículo não encontrado'));

      await expect(controller.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um veículo existente e retornar uma mensagem de sucesso', async () => {
      const updateVehicleDto: UpdateVehicleDto = { model: 'Modelo Z' };
      const updatedVehicle = { id: '1', model: 'Modelo Z' };
      mockVehiclesService.update.mockResolvedValue(updatedVehicle);

      const result = await controller.update('1', updateVehicleDto);
      expect(result).toEqual({
        message: 'Veículo atualizado com sucesso.',
        vehicle: updatedVehicle,
      });
    });

    it('deve lançar erro ao tentar atualizar veículo não existente', async () => {
      mockVehiclesService.update.mockRejectedValue(new NotFoundException('Veículo não encontrado'));

      await expect(controller.update('1', {} as UpdateVehicleDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status do veículo e retornar uma mensagem de sucesso', async () => {
      const updatedVehicle = { id: '1', status: 'inativo' };
      mockVehiclesService.updateStatus.mockResolvedValue(updatedVehicle);

      const result = await controller.updateStatus('1', 'inativo');
      expect(result).toEqual({
        message: 'Status do veículo atualizado com sucesso.',
        vehicle: updatedVehicle,
      });
    });
  });

  describe('remove', () => {
    it('deve deletar o veículo pelo ID e retornar uma mensagem de sucesso', async () => {
      mockVehiclesService.delete.mockResolvedValue(undefined);

      const result = await controller.remove('1');
      expect(result).toEqual({
        message: 'Veículo excluído com sucesso.',
      });
      expect(mockVehiclesService.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro ao tentar deletar veículo não existente', async () => {
      mockVehiclesService.delete.mockRejectedValue(new NotFoundException('Veículo não encontrado'));

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
