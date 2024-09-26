import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { ListUsersDTO } from './dto/ListUser.dto';
import { UpdateUserDTO } from './dto/UpdateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDTO: CreateUserDTO) {
    const userEntity = new UserEntity();

    userEntity.name = createUserDTO.name;
    userEntity.email = createUserDTO.email;
    userEntity.role = createUserDTO.role;
    userEntity.sector = createUserDTO.sector;
    userEntity.password = createUserDTO.password;
    userEntity.isActive = createUserDTO.isActive;

    return this.userRepository.save(userEntity);
  }

  async listUsers(isActive?: boolean) {
    console.log(isActive);

    const usersSaved =
      isActive === undefined
        ? await this.userRepository.find()
        : await this.userRepository.find({ where: { isActive: isActive } });
    const usersList = usersSaved.map(
      (user) => new ListUsersDTO(user.id, user.name, user.role, user.isActive),
    );
    return usersList;
  }

  async findByEmail(email: string) {
    const checkEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (checkEmail === null)
      throw new NotFoundException('O email não foi encontrado.');

    return checkEmail;
  }

  async findById(id: string) {
    const checkId = await this.userRepository.findOne({
      where: { id },
    });

    if (checkId === null)
      throw new NotFoundException('O email não foi encontrado.');

    return checkId;
  }

  async updateUser(id: string, newData: UpdateUserDTO) {
    const user = await this.userRepository.findOneBy({ id });

    if (user === null)
      throw new NotFoundException('O usuário não foi encontrado.');

    Object.assign(user, newData as UserEntity);

    return this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('O usuário não foi encontrado');
    }

    user.isActive = false;

    return await this.userRepository.save(user);
  }
}
