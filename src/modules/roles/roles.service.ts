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
      throw new NotFoundException("roles nao encontradas");
    }

    return roles;
  }
}
