import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientDto } from './dto/list-client.dto';
import { AddressDto } from './dto/address.dto';

const mockClientRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

describe('ClientService', () => {
  let service: ClientService;
  let repository: Repository<Client>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12.345.678/9234-12',
        phone: '(12) 97343-1234',
        address: {
          zipCode: '12345-123',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua X',
          number: '123',
          complement: 'Apt 101',
        },
      };

      const createdClient = {
        id: 'client-123',
        ...createClientDto,
      };

      mockClientRepository.save.mockResolvedValue(createdClient);

      const result = await service.create(createClientDto);

      expect(result).toEqual(createdClient);
      expect(mockClientRepository.save).toHaveBeenCalledWith(
        expect.any(Client),
      );
    });

    it('should throw an error if required fields are missing or invalid', async () => {
      const invalidClientDto: CreateClientDto = {
        name: '', // Nome vazio para simular erro
        email: 'invalidemail.com', // E-mail inválido
        cnpj: '12.345.678/0000-00', // CNPJ inválido
        phone: '123456789', // Telefone inválido
        address: {
          zipCode: '',
          state: '',
          city: '',
          neighborhood: '',
          street: '',
          number: '',
          complement: '',
        },
      };

      mockClientRepository.save.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await expect(service.create(invalidClientDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return a list of clients based on filters', async () => {
      const filters = { name: 'Client X', isActive: true };

      const clients = [
        {
          id: 'client-123',
          name: 'Client X',
          email: 'client@gmail.com',
          cnpj: '12.345.678/9234-12',
          phone: '(12) 97343-1234',
          address: {
            zipCode: '12345-123',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Centro',
            street: 'Rua X',
            number: '123',
            complement: 'Apt 101',
          },
        },
      ];

      mockClientRepository.find.mockResolvedValue(clients);

      const result = await service.findAll(filters);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(expect.any(ListClientDto));
      expect(mockClientRepository.find).toHaveBeenCalledWith({
        where: filters,
      });
    });

    it('should throw an InternalServerErrorException if no clients are found', async () => {
      mockClientRepository.find.mockResolvedValue([]);

      await expect(service.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should return a client by ID', async () => {
      const client = {
        id: 'client-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12.345.678/9234-12',
        phone: '(12) 97343-1234',
        address: {
          zipCode: '12345-123',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua X',
          number: '123',
          complement: 'Apt 101',
        },
      };

      mockClientRepository.findOne.mockResolvedValue(client);

      const result = await service.findById('client-123');

      expect(result).toEqual(client);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'client-123' },
      });
    });

    it('should throw NotFoundException if client is not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('client-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateClientDto: UpdateClientDto = {
        name: 'Updated Client',
        email: 'updatedclient@gmail.com',
        phone: '(12) 4002-8922',
        cnpj: '12.345.678/9012-34',
        address: new AddressDto(),
      };

      const client = {
        id: 'client-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12.345.678/9234-12',
        phone: '(12) 97343-1234',
        address: new AddressDto()
      };

      const updatedClient = {
        id: 'client-123',
        ...updateClientDto,
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.save.mockResolvedValue(updatedClient);

      const result = await service.update('client-123', updateClientDto);

      expect(result).toEqual({
        client: updatedClient,
      });
      expect(mockClientRepository.save).toHaveBeenCalledWith(updatedClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('client-123', {} as UpdateClientDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a client if there are no service orders', async () => {
      const client = {
        id: 'client-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12.345.678/9234-12',
        phone: '(12) 97343-1234',
        isActive: true,
        serviceOrder: [], // Sem ordens de serviço
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.delete.mockResolvedValue(undefined); // Simula exclusão

      const result = await service.remove('client-123');

      expect(result.clientRemoved).toEqual(client);
      expect(result.message).toEqual(
        `cliente com id: client-123 excluído com sucesso`,
      );
      expect(mockClientRepository.delete).toHaveBeenCalledWith('client-123');
    });

    it('should desactivate a client if there are service orders', async () => {
      const client = {
        id: 'client-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '12.345.678/9234-12',
        phone: '(12) 97343-1234',
        isActive: true,
        serviceOrder: [{}], // Com ordens de serviço
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.save.mockResolvedValue({ ...client, isActive: false });

      const result = await service.remove('client-123');

      expect(result.clientRemoved).toEqual({ ...client, isActive: false });
      expect(result.message).toEqual(
        `cliente com id: client-123 arquivado com sucesso`,
      );
      expect(mockClientRepository.save).toHaveBeenCalledWith({
        ...client,
        isActive: false,
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('client-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
