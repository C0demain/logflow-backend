import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './roles.entity';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { ListRoleDTO } from './dto/list-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async createRole(createRoleDto: CreateRoleDTO) {
    const roleEntity = new RoleEntity();

    roleEntity.name = createRoleDto.name;

    return this.roleRepository.save(roleEntity);
  }

  async listRoles() {
    const rolesSaved = await this.roleRepository.find();
    const rolesList = rolesSaved.map(
      (role) => new ListRoleDTO(role.id, role.name),
    );
    return rolesList;
  }

  async updateRole(id: number, newData: UpdateRoleDTO) {
    const role = await this.roleRepository.findOneBy({ id });

    if (role === null)
      throw new NotFoundException('A função não foi encontrada');

    Object.assign(role, newData as RoleEntity);

    return this.roleRepository.save(role);
  }

  async deleteRole(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException('A função não foi encontrada');
    }

    await this.roleRepository.delete(role.id);

    return role;
  }
}
