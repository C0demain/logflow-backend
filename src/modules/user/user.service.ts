import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserQueryFilters } from 'src/modules/user/dto/user-query-filters';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { RoleEntity } from '../roles/roles.entity';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { ListUsersDTO } from './dto/ListUser.dto';
import { UpdateUserDTO } from './dto/UpdateUser.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async createUser(createUserDTO: CreateUserDTO) {
    const userEntity = new UserEntity();

    const role = await this.roleRepository.findOne({
      where: { name: createUserDTO.role },
    });
    if (!role) {
      throw new NotFoundException(
        `Função ${createUserDTO.role} não encontrada.`,
      );
    }

    userEntity.name = createUserDTO.name;
    userEntity.email = createUserDTO.email;
    userEntity.role = role;
    userEntity.sector = createUserDTO.sector;
    userEntity.password = createUserDTO.password;

    return this.userRepository.save(userEntity);
  }

  async listUsers(filters?: UserQueryFilters) {
    const where: FindOptionsWhere<UserEntity> = {};

    if (filters?.activeUsers === undefined) {
      where.deactivatedAt = IsNull();
    } else {
      where.deactivatedAt = filters?.activeUsers ? IsNull() : Not(IsNull());
    }

    if (filters?.sector) {
      where.sector = filters.sector;
    }

    if (filters?.roleId) {
      const role = await this.roleRepository.findOneBy({ id: filters.roleId });
      if (!role) {
        throw new NotFoundException(
          `Role com id ${filters.roleId} não encontrada`,
        );
      }

      where.role = role;
    }

    const usersSaved = await this.userRepository.find({ where });
    const usersList = usersSaved.map(
      (user) =>
        new ListUsersDTO(
          user.id,
          user.name,
          user.role.name,
          user.deactivatedAt,
          user.email,
          user.sector,
        ),
    );
    return usersList;
  }

  async findByEmail(email: string) {
    const checkEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (checkEmail === null) {
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
        where: { name: newData.role },
      });

      if (!role) {
        throw new NotFoundException(`Função "${newData.role}" não encontrada.`);
      }

      user.role = role;
      delete newData.role;
    }

    Object.assign(user, newData);

    return this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('O usuário não foi encontrado.');
    }

    user.deactivatedAt = new Date();

    return await this.userRepository.save(user);
  }

  async getTurnover(filters: { startDate?: Date; endDate?: Date }) {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      throw new BadRequestException('A data de início deve ser anterior à data final.');
    }

    const where: FindOptionsWhere<UserEntity> = {};

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    const newUsers = await this.userRepository.count({
      where: { ...where, deactivatedAt: IsNull() },
    });

    const deactivatedUsers = await this.userRepository.count({
      where: { ...where, deactivatedAt: Not(IsNull()) },
    });

    const allUsers = await this.userRepository.count();

    const turnover = {
      ratio: ((newUsers + deactivatedUsers) / (2 * allUsers)) * 100,
      difference: newUsers - deactivatedUsers,
      newUsers,
      deactivatedUsers,
    };

    return turnover;
  }
}
