import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ListClientDto } from './dto/list-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const clientCreated = new Client();

    clientCreated.address = {
      zipCode: createClientDto.zipCode,
      state: createClientDto.state,
      city: createClientDto.city,
      neighborhood: createClientDto.neighborhood,
      street: createClientDto.street,
      number: createClientDto.number,
      complement: createClientDto.complement,
    };

    clientCreated.cnpj = createClientDto.cnpj;
    clientCreated.email = createClientDto.email;
    clientCreated.name = createClientDto.name;
    clientCreated.phone = createClientDto.phone;

    return await this.clientRepository.save(clientCreated);
  }

  async findAll(filters: {
    id?: string;
    name?: string;
    email?: string;
    cnpj?: string;
    active?: boolean;
  }) {
    const where: FindOptionsWhere<Client> = {};

    if (filters.id) {
      where.id = filters.id;
    }

    if (filters.name) {
      where.name = filters.name;
    }

    if (filters.email) {
      where.email = filters.email;
    }

    if (filters.cnpj) {
      where.cnpj = filters.cnpj;
    }

    where.isActive = filters.active === undefined ? true : filters.active;

    const clientsFound = await this.clientRepository.find({ where });

    if (!clientsFound || clientsFound.length === 0) {
      throw new InternalServerErrorException('nenhum cliente encontrado');
    }

    const clients = clientsFound.map((client) => {
      return new ListClientDto(
        client.id,
        client.name,
        client.phone,
        client.cnpj,
        client.email,
        {
          zipCode: client.address.zipCode,
          state: client.address.state,
          city: client.address.city,
          neighborhood: client.address.neighborhood,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement,
        },
      );
    });

    return clients;
  }

  async findById(id: string) {
    const clientFound = await this.clientRepository.findOne({ where: { id } });

    if (!clientFound) {
      throw new NotFoundException(`cliente com id ${id} não encotrado`);
    }

    return clientFound;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const clientFound = await this.clientRepository.findOne({ where: { id } });

    if (!clientFound) {
      throw new NotFoundException(`cliente com id ${id} não encotrado`);
    }

    Object.assign(clientFound, updateClientDto as Client);
    Object.assign(clientFound.address, updateClientDto as Client);

    const updatedClient = await this.clientRepository.save(clientFound);

    return {
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        phone: updatedClient.phone,
        cnpj: updatedClient.cnpj,
        email: updatedClient.email,
        address: updatedClient.address,
      },
    };
  }

  async remove(id: string) {
    const clientFound = await this.clientRepository.findOne({
      where: { id },
    });

    if (!clientFound) {
      throw new NotFoundException(`Cliente com id: ${id}, não encontrado`);
    }

    clientFound.isActive = false;
    await this.clientRepository.save(clientFound);

    return clientFound;
  }
}
