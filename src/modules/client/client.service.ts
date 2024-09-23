import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ListClientDto } from './dto/list-client.dto';

@Injectable()
export class ClientService {

  constructor(@InjectRepository(Client) private readonly clientRepository: Repository<Client>)
  {}

  async create(createClientDto: CreateClientDto){
    const clientCreated = new Client();

    clientCreated.address  = {
      cep: createClientDto.cep,
      estado: createClientDto.estado,
      cidade: createClientDto.cidade,
      bairro: createClientDto.bairro,
      rua: createClientDto.rua,
      numero: createClientDto.numero,
      complemento: createClientDto.complemento
    };

    clientCreated.cnpj = createClientDto.cnpj;
    clientCreated.email = createClientDto.email;
    clientCreated.name = createClientDto.name;
    clientCreated.telefone = createClientDto.telefone;

    return await this.clientRepository.save(clientCreated);
  }

  async findAll() {
    const clientsFound = await this.clientRepository.find();

    if(!clientsFound || clientsFound.length === 0){
      throw new InternalServerErrorException("nenhum cliente encontrado");
    }

    const clients = clientsFound.map(
      (client) =>{
        return new ListClientDto(
          client.id,
          client.name,
          client.telefone,
          client.telefone,
          client.email,
          {
            cep: client.address.cep,
            estado: client.address.estado,
            cidade: client.address.cidade,
            bairro: client.address.bairro,
            rua: client.address.rua,
            numero: client.address.numero,
            complemento: client.address.complemento
          }

        )
      })

      return clients;
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
