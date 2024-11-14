import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { ListUsersDTO } from './dto/ListUser.dto';
import { UpdateUserDTO } from './dto/UpdateUser.dto';
import { FindOptionsWhere } from 'typeorm'
import { RoleEntity } from '../roles/roles.entity';
import { UserQueryFilters } from 'src/modules/user/dto/user-query-filters';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity) 
    private readonly roleRepository: Repository<RoleEntity>
  ) {}

  async createUser(createUserDTO: CreateUserDTO) {
    const userEntity = new UserEntity();

    const role = await this.roleRepository.findOne({where: {name: createUserDTO.role}})
    if(!role){
      throw new NotFoundException(`Função ${createUserDTO.role} não encontrada.`)  
    }

    userEntity.name = createUserDTO.name;
    userEntity.email = createUserDTO.email;
    userEntity.role = role;
    userEntity.sector = createUserDTO.sector;
    userEntity.password = createUserDTO.password;
    userEntity.isActive = createUserDTO.isActive;

    return this.userRepository.save(userEntity);
  }

  async listUsers(filters?: UserQueryFilters) {
    const where: FindOptionsWhere<UserEntity> = {}
    where.isActive = filters?.activeUsers !== undefined ? filters?.activeUsers : true

    if(filters?.sector){
      where.sector = filters.sector
    }

    const usersSaved = await this.userRepository.find({where})
    const usersList = usersSaved.map(
      (user) => new ListUsersDTO(user.id, user.name, user.role.name, user.isActive, user.email, user.sector),
    );
    return usersList;
  }

  async findByEmail(email: string) {
    const checkEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (checkEmail === null){
      throw new NotFoundException('O email não foi encontrado.');
    }
    
    return checkEmail;
  }

  async findById(id: string) {
    const checkId = await this.userRepository.findOne({
      where: { id },
    });

    if (checkId === null) {
      throw new NotFoundException(`Usuário com id ${id} não foi encontrado.`);
    }

    return checkId;
  }

  async updateUser(id: string, newData: UpdateUserDTO) {
    const user = await this.userRepository.findOneBy({ id });
  
    if (!user) {
      throw new NotFoundException('O usuário não foi encontrado.');
    }

    if (newData.role) {
      const role = await this.roleRepository.findOne({
        where: { name: newData.role},
      });
  
      if (!role) {
        throw new NotFoundException(`Função "${newData.role}" não encontrada.`);
      }

      user.role = role
      delete newData.role
    }

    Object.assign(user, newData)
  
    return this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('O usuário não foi encontrado.');
    }

    user.isActive = false;

    return await this.userRepository.save(user);
  }
}
