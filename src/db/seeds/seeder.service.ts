import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RoleEntity } from 'src/modules/roles/roles.entity';
import { Repository } from 'typeorm';
import 'dotenv/config';
import { Sector } from 'src/modules/service-order/enums/sector.enum';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly hashPasswordPipe: HashPasswordPipe,
  ) {}

  async run(): Promise<void> {
    try {
      await this.seedRoles(); // Injetando as roles no banco

      const usersCount = await this.userRepository.count();
      if (usersCount > 0) {
        console.log('Usuário padrão já foi adicionado como seeder.');
        return;
      }

      const userName = process.env.DEFAULT_USER_NAME;
      const userEmail = process.env.DEFAULT_USER_EMAIL;
      const userPassword = process.env.DEFAULT_USER_PASSWORD;

      if (!userName || !userEmail || !userPassword) {
        console.error('As variáveis de ambiente estão incompletas.');
        throw new Error('Variáveis de ambiente faltando');
      }

      const user = new UserEntity();
      user.name = userName;
      user.email = userEmail;

      // Atribuir role padrão ao usuário
      const defaultRole = await this.roleRepository.findOne({ where: { name: 'Gerente Operacional' } });
      if(defaultRole){
      user.role = defaultRole;
      }
      user.sector = Sector.OPERACIONAL;
      user.password = await this.hashPasswordPipe.transform(userPassword);

      await this.userRepository.save(user);

      console.log('Usuário Padrão criado com sucesso');
    } catch (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('Tabela de users ainda não existe. Seeders não serão executados.');
      } else {
        console.error('Erro ao criar o usuário padrão:', error.stack);
        throw new Error('Erro ao criar o usuário padrão');
      }
    }
  }

  // Método para injetar as roles no banco de dados
  private async seedRoles(): Promise<void> {
    const roles = [
      { name: 'Vendedor', description: 'Responsável pelas vendas', sector: Sector.COMERCIAL },
      { name: 'SAC', description: 'Atendimento ao cliente', sector: Sector.COMERCIAL },
      { name: 'Motorista', description: 'Responsável pelas entregas', sector: Sector.OPERACIONAL },
      { name: 'Analista de Logística', description: 'Gerenciamento de logística', sector: Sector.OPERACIONAL },
      { name: 'Consultoria', description: 'Consultoria especializada', sector: Sector.COMERCIAL },
      { name: 'Diretor Comercial', description: 'Diretor do setor comercial', sector: Sector.COMERCIAL },
      { name: 'Diretor Administrativo', description: 'Diretor do setor administrativo', sector: Sector.FINANCEIRO },
      { name: 'Analista de RH', description: 'Responsável pelo RH', sector: Sector.FINANCEIRO },
      { name: 'Analista Administrativo "Financeiro"', description: 'Administração financeira', sector: Sector.FINANCEIRO },
      { name: 'Ass. Adminstrativo "RH"', description: 'Assistente administrativo de RH', sector: Sector.FINANCEIRO },
      { name: 'Ass. Administrativo "Operacional"', description: 'Assistente administrativo operacional', sector: Sector.OPERACIONAL },
      { name: 'Ass. Administrativo "Financeiro"', description: 'Assistente administrativo financeiro', sector: Sector.FINANCEIRO },
      { name: 'Gerente Operacional', description: 'Gerente do setor operacional', sector: Sector.OPERACIONAL },
    ];

    for (const roleData of roles) {
      const roleExists = await this.roleRepository.findOne({ where: { name: roleData.name } });
      if (!roleExists) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
      }
    }

    console.log('Roles predefinidas inseridas com sucesso');
  }
}
