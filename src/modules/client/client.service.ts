import {
  BadRequestException,
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
import axios from "axios";
import { isValidUUID } from '../../resources/validations/isValidUUID';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async fetchAddressByCep(cep: string) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        throw new Error("CEP não encontrado.");
      }
      return {
        zipCode: cep,
        state: response.data.uf,
        city: response.data.localidade,
        neighborhood: response.data.bairro,
        street: response.data.logradouro,
      }
    } catch (error) {
      throw new Error(`Erro ao buscar endereço: ${error.message}`);
    }
  }

  async create(createClientDto: CreateClientDto) {
    const clientCreated = new Client();

    const address = await this.fetchAddressByCep(createClientDto.address.zipCode);

    clientCreated.address = {
      ...address,
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
      throw new InternalServerErrorException('Nenhum cliente encontrado.');
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
      throw new NotFoundException(`Cliente com id ${id} não encotrado.`);
    }

    return clientFound;
  }
  
  async update(id: string, updateClientDto: UpdateClientDto) {
    if (!isValidUUID(id)) {
      throw new BadRequestException(`O id fornecido (${id}) não é um UUID válido.`);
    }

    const clientFound = await this.clientRepository.findOne({ where: { id } });
    
    if (!clientFound) {
      throw new NotFoundException(`Cliente com id ${id} não encontrado.`);
    }

    const updatedClient = new Client();
    updatedClient.id = clientFound.id;
    updatedClient.name = updateClientDto.name || clientFound.name;
    updatedClient.phone = updateClientDto.phone || clientFound.phone;
    updatedClient.cnpj = updateClientDto.cnpj || clientFound.cnpj;
    updatedClient.email = updateClientDto.email || clientFound.email;

    // Verifica se o CEP foi atualizado
    if (updateClientDto.address?.zipCode && updateClientDto.address.zipCode !== clientFound.address.zipCode) {
      const newAddress = await this.fetchAddressByCep(updateClientDto.address.zipCode);
      updatedClient.address = {
        ...newAddress,
        number: updateClientDto.address.number || clientFound.address.number,
        complement: updateClientDto.address.complement || clientFound.address.complement,
      };
    } else {
      // Se o CEP não mudou, mantém o endereço atual
      updatedClient.address = {
        zipCode: clientFound.address.zipCode,
        state: clientFound.address.state,
        city: clientFound.address.city,
        neighborhood: clientFound.address.neighborhood,
        street: clientFound.address.street,
        number: updateClientDto.address?.number || clientFound.address.number,
        complement: updateClientDto.address?.complement || clientFound.address.complement,
      };
    }

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
      throw new NotFoundException(`Cliente com id: ${id}, não encontrado.`);
    }

    if (clientFound.serviceOrder && clientFound.serviceOrder.length === 0) {
      message = `cliente com id: ${id} excluído com sucesso`;
      await this.clientRepository.delete(id);
    } else {
      clientFound.isActive = false;
      message = `cliente com id: ${id} arquivado com sucesso`
      await this.clientRepository.save(clientFound);
    }

    return {
      clientRemoved: clientFound,
      message: message
    };
  }

}
