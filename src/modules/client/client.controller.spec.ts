import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthenticationGuard } from '../auth/authentication.guard';

const mockClientService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClientController', () => {
  let controller: ClientController;
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ClientController>(ClientController);
    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client and return success message', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Test Client',
        email: 'client@example.com',
        cnpj: '12345678901234',
        phone: '123456789',
        zipCode: '12345-678',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        street: 'Rua X',
        number: '123',
        complement: 'Apt 101',
      };

      const createdClient = { id: '1', ...createClientDto };
      mockClientService.create.mockResolvedValue(createdClient);

      const result = await controller.create(createClientDto);

      expect(result).toEqual({
        message: 'Cliente cadastrado com sucesso',
        client: createdClient,
      });
      expect(mockClientService.create).toHaveBeenCalledWith(createClientDto);
    });
  });

  describe('findAll', () => {
    it('should return a list of clients', async () => {
      const clients = [
        {
          id: '1',
          name: 'Test Client',
          email: 'client@example.com',
          cnpj: '12345678901234',
          phone: '123456789',
          isActive: true,
          address: {
            zipCode: '12345-678',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Centro',
            street: 'Rua X',
            number: '123',
            complement: 'Apt 101',
          },
        },
      ];

      mockClientService.findAll.mockResolvedValue(clients);

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'Clientes encontrados',
        clients: clients,
      });
      expect(mockClientService.findAll).toHaveBeenCalledWith({
        id: undefined,
        name: undefined,
        email: undefined,
        cnpj: undefined,
        active: undefined,
      });
    });

    it('should return a list of inactive clients', async () => {
      const clients = [
        {
          id: '1',
          name: 'Test Client',
          email: 'client@example.com',
          cnpj: '12345678901234',
          phone: '123456789',
          isActive: false,
          address: {
            zipCode: '12345-678',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Centro',
            street: 'Rua X',
            number: '123',
            complement: 'Apt 101',
          },
        },
      ];

      mockClientService.findAll.mockResolvedValue(clients);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      );

      expect(result).toEqual({
        message: 'Clientes encontrados',
        clients: clients,
      });
      expect(mockClientService.findAll).toHaveBeenCalledWith({
        id: undefined,
        name: undefined,
        email: undefined,
        cnpj: undefined,
        active: false,
      });
    });

    it('should return an empty list if no clients are found', async () => {
      mockClientService.findAll.mockRejectedValue(
        new Error('nenhum cliente encontrado'),
      );

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'nenhum cliente encontrado',
        clients: [],
      });
    });
  });

  describe('update', () => {
    it('should update a client and return success message', async () => {
      const updateClientDto: UpdateClientDto = {
        name: 'Updated Client',
        email: 'updated@example.com',
      };

      const updatedClient = { id: '1', ...updateClientDto };
      mockClientService.update.mockResolvedValue({ client: updatedClient });

      const result = await controller.update('1', updateClientDto);

      expect(result).toEqual({
        message: 'Cliente atualizado com sucesso',
        client: { client: updatedClient },
      });
      expect(mockClientService.update).toHaveBeenCalledWith(
        '1',
        updateClientDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a client and return success message', async () => {
      const removedClient = { id: '1', name: 'Test Client' };
      mockClientService.remove.mockResolvedValue(removedClient);

      const result = await controller.remove('1');

      expect(result).toEqual({
        message: 'Cliente removido com sucesso',
        client: removedClient,
      });
      expect(mockClientService.remove).toHaveBeenCalledWith('1');
    });
  });
});
