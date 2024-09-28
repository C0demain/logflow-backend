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
        cnpj: '123456789',
        phone: '123456789',
        zipCode: '12345',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        street: 'Rua X',
        number: '123',
        complement: 'Apt 101',
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
  });

  describe('findAll', () => {
    it('should return a list of clients based on filters', async () => {
      const filters = { name: 'Client X', isActive: true };

      const clients = [
        {
          id: 'client-123',
          name: 'Client X',
          email: 'client@gmail.com',
          cnpj: '123456789',
          phone: '123456789',
          address: {
            zipCode: '12345',
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

    it('should throw an exception if no clients are found', async () => {
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
        cnpj: '123456789',
        phone: '123456789',
        address: {
          zipCode: '12345',
          state: 'SP',
          city: 'São Paulo',
          neighboord: 'Centro',
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

    it('should throw NotFoundException if client not found', async () => {
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
      };

      const client = {
        id: 'client-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '123456789',
        phone: '123456789',
        address: {
          zipCode: '12345',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua X',
          number: '123',
          complement: 'Apt 101',
        },
      };

      const updatedClient = { ...client, ...updateClientDto };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.save.mockResolvedValue(updatedClient);

      const result = await service.update('client-123', updateClientDto);

      expect(result.client).toEqual(updatedClient);
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
    it('should delete a client', async () => {
      const client = {
        id: 'client-123',
        name: 'Client X',
        email: 'client@gmail.com',
        cnpj: '123456789',
        phone: '123456789',
        address: {
          zipCode: '12345',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua X',
          number: '123',
          complement: 'Apt 101',
        },
        isActive: true,
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.delete.mockResolvedValue({
        ...client,
        isActive: false,
      });

      const result = await service.remove('client-123');

      expect(result.isActive).toBeFalsy();
      expect(mockClientRepository.save).toHaveBeenCalledWith(client);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('client-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
