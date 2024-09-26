import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FindOptionsWhere, Repository } from "typeorm";
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

  async findAll(filters: { id?: string ,name?: string, email?: string, cnpj?: string}) {

    const where: FindOptionsWhere<Client> = {};

    if(filters.id){
      where.id = filters.id;
    }

    if (filters.name) {
      where.name = filters.name;
    }
  
    if (filters.email) {
      where.email = filters.email;
    }

    if(filters.cnpj){
      where.cnpj = filters.cnpj;
    }
  

    const clientsFound = await this.clientRepository.find({where});

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

  async findById(id: string){
    const clientFound = await this.clientRepository.findOne({where: {id}});
    
    if(!clientFound){
      throw new NotFoundException(`cliente com id ${id} não encotrado`);
    }

    return clientFound;

  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const clientFound = await this.clientRepository.findOne({where:{id}});

    if(!clientFound){
      throw new NotFoundException(`cliente com id ${id} não encotrado`);
    }

    Object.assign(clientFound, updateClientDto as Client);

    const updatedClient = await this.clientRepository.save(clientFound);

    return {
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        telefone: updatedClient.telefone,
        cnpj: updatedClient.cnpj,
        email: updatedClient.email,
        address: updatedClient.address,
      },
    }
  }

  async remove(id: string) {
    const clientFound = await this.clientRepository.findOne({
      where:{id}
    });

    if(!clientFound){
      throw new NotFoundException(`Cliente com id: ${id}, não encontrado`);
    }

    await this.clientRepository.delete(clientFound.id);

    return clientFound;
  }
}
