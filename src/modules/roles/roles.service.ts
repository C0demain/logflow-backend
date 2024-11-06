import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './roles.entity';
import { Repository } from 'typeorm'
import { NotFoundError } from 'rxjs';

@Injectable()
export class RolesService {

  constructor(@InjectRepository(RoleEntity) private readonly repository: Repository<RoleEntity>){}

  async findAll() {
    const roles = await this.repository.find()

    if(!roles){
      throw new NotFoundException("Funções não encontradas.");
    }

    return roles;
  }

  async findById(id: string){
    const role = await this.repository.findOneBy({ id })

    if(!role){
      throw new NotFoundException(`Função com id ${id} não encontrada.`);
    }

    return role;
  }
}
