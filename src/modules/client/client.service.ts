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
      zipCode: createClientDto.address.zipCode,
      state: createClientDto.address.state,
      city: createClientDto.address.city,
      neighborhood: createClientDto.address.neighborhood,
      street: createClientDto.address.street,
      number: createClientDto.address.number,
      complement: createClientDto.address.complement,
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
    throw new NotFoundException(`Cliente com id ${id} não encontrado.`);
  }

  const updatedClient = new Client();

  // Atribuição de valores obrigatórios
  updatedClient.id = clientFound.id; // Mantém o ID do cliente existente
  updatedClient.name = updateClientDto.name || clientFound.name; // Usa o valor atual se não fornecido
  updatedClient.phone = updateClientDto.phone || clientFound.phone;
  updatedClient.cnpj = updateClientDto.cnpj || clientFound.cnpj;
  updatedClient.email = updateClientDto.email || clientFound.email;

  // Atribuição do endereço
  updatedClient.address = {
    zipCode: updateClientDto.address?.zipCode || clientFound.address.zipCode,
    state: updateClientDto.address?.state || clientFound.address.state,
    city: updateClientDto.address?.city || clientFound.address.city,
    neighborhood: updateClientDto.address?.neighborhood || clientFound.address.neighborhood,
    street: updateClientDto.address?.street || clientFound.address.street,
    number: updateClientDto.address?.number || clientFound.address.number,
    complement: updateClientDto.address?.complement || clientFound.address.complement,
  };

  const savedClient = await this.clientRepository.save(updatedClient);

  return {
    client: {
      id: savedClient.id,
      name: savedClient.name,
      phone: savedClient.phone,
      cnpj: savedClient.cnpj,
      email: savedClient.email,
      address: savedClient.address,
    },
  };
}


  async remove(id: string) {
    const clientFound = await this.clientRepository.findOne({
      where: { id },
      relations: ['serviceOrder'],
    });

    let message = "";
  
    if (!clientFound) {
      throw new NotFoundException(`Cliente com id: ${id}, não encontrado`);
    }
  
    if (clientFound.serviceOrder && clientFound.serviceOrder.length === 0) {
      message = `cliente com id: ${id} excluído com sucesso`;
      await this.clientRepository.delete(id);
    }else{
      clientFound.isActive = false;
      message = `cliente com id: ${id} arquivado com sucesso`
      await this.clientRepository.save(clientFound);
    }
  
    return{
      clientRemoved: clientFound,
      message: message
    };
  }
  
}
