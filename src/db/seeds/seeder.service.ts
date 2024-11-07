import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RoleEntity } from 'src/modules/roles/roles.entity';
import { Repository } from 'typeorm';
import 'dotenv/config';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { Process } from 'src/modules/process/entities/process.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { TaskStage } from 'src/modules/task/enums/task.stage.enum';

@Injectable()
export class SeederService {
  private readonly logger: Logger = new Logger('SeederService')

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly hashPasswordPipe: HashPasswordPipe,
  ) {}

  async run(): Promise<void> {
    try {
      await this.seedRoles(); // Injetando as roles no banco

      if(await this.processRepository.count() === 0){
        await this.seedProcess() // Injetando processo base
      }

      const usersCount = await this.userRepository.count();
      if (usersCount > 0) {
        this.logger.log('Usuário padrão já foi adicionado como seeder.');
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
      const defaultRole = await this.roleRepository.findOne({ where: { name: 'Administrador' } });
      if(defaultRole){
      user.role = defaultRole;
      }
      user.sector = Sector.DIRETORIA;
      user.password = await this.hashPasswordPipe.transform(userPassword);

      await this.userRepository.save(user);

      this.logger.log('Usuário Padrão criado com sucesso');
    } catch (error) {
      if (error.message.includes('relation "users" does not exist')) {
        this.logger.log('Tabela de users ainda não existe. Seeders não serão executados.');
      } else {
        console.error('Erro ao criar o usuário padrão:', error.stack);
        throw new Error('Erro ao criar o usuário padrão');
      }
    }
  }

  // Método para injetar as roles no banco de dados
  private async seedRoles(): Promise<void> {
    const roles = [
      { name: 'Administrador', description: 'administrador geral', sector: Sector.DIRETORIA },
      { name: 'Vendedor', description: 'Responsável pelas vendas', sector: Sector.VENDAS },
      { name: 'SAC', description: 'Atendimento ao cliente', sector: Sector.OPERACIONAL },
      { name: 'Motorista', description: 'Responsável pelas entregas', sector: Sector.OPERACIONAL },
      { name: 'Analista de Logística', description: 'Gerenciamento de logística', sector: Sector.OPERACIONAL },
      { name: 'Consultoria', description: 'Consultoria especializada', sector: Sector.DIRETORIA},
      { name: 'Diretor Comercial', description: 'Diretor do setor comercial', sector: Sector.DIRETORIA},
      { name: 'Diretor Administrativo', description: 'Diretor do setor administrativo', sector: Sector.FINANCEIRO },
      { name: 'Analista de RH', description: 'Responsável pelo RH', sector: Sector.RH },
      { name: 'Analista Administrativo "Financeiro"', description: 'Administração financeira', sector: Sector.FINANCEIRO },
      { name: 'Ass. Administrativo "RH"', description: 'Assistente administrativo de RH', sector: Sector.RH },
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

    this.logger.log('Roles predefinidas inseridas com sucesso');
  }

  private async seedProcess(): Promise<void> {
    const baseProcess = await this.processRepository.save({title: 'Pedido c/ entrega'})

    const motoristaRole = await this.roleRepository.findOne({ where: { name: 'Motorista' } });
    const financeiroRole = await this.roleRepository.findOne({ where: { name: 'Analista Administrativo "Financeiro"' } });
    const operacionalRole = await this.roleRepository.findOne({ where: { name: 'Gerente Operacional' } });

    if(!motoristaRole || !financeiroRole || !operacionalRole){
      throw new NotFoundException("Funções não encontradas.")
    }

    const tasks = [
      this.createTask('Documentos de Coleta', Sector.OPERACIONAL, TaskStage.DOCUMENTS_ISSUANCE, motoristaRole, baseProcess),
      this.createTask('Endereço de Coleta', Sector.OPERACIONAL, TaskStage.DOCUMENTS_ISSUANCE, motoristaRole, baseProcess),
      this.createTask('Motorista: Assinatura de Coleta', Sector.OPERACIONAL, TaskStage.COLLECTION, motoristaRole, baseProcess),
      this.createTask('Motorista: Trazer p/ Galpão', Sector.OPERACIONAL, TaskStage.COLLECTION, operacionalRole, baseProcess),
  
      this.createTask('Documentos de Entrega', Sector.OPERACIONAL, TaskStage.DELIVERY_DOCUMENTS_ISSUANCE, motoristaRole, baseProcess),
      this.createTask('Endereço de Entrega', Sector.OPERACIONAL, TaskStage.DELIVERY_DOCUMENTS_ISSUANCE, motoristaRole, baseProcess),
      this.createTask('Motorista: Assinatura de Entrega', Sector.OPERACIONAL, TaskStage.DELIVERY, motoristaRole, baseProcess),
      this.createTask('Motorista: Devolução de Documentos', Sector.OPERACIONAL, TaskStage.DELIVERY, operacionalRole, baseProcess),
  
      this.createTask('Confirmação de Entrega', Sector.FINANCEIRO, TaskStage.DELIVERY_CONFIRMATION, financeiroRole, baseProcess),
      this.createTask('Emissão de NF/BOLETO', Sector.FINANCEIRO, TaskStage.BUDGET_CHECK, financeiroRole, baseProcess),
      this.createTask('Confirmação de Recebimento', Sector.FINANCEIRO, TaskStage.SALE_COMPLETED, financeiroRole, baseProcess)
    ]

    for(let t of tasks){
      await this.taskRepository.save(t)
    }

    this.logger.log('Processo base criado com sucesso');
  }

  private createTask(
    title: string,
    sector: Sector,
    stage: TaskStage,
    role: RoleEntity,
    process: Process
  ): Task {
    const task = new Task();
    task.title = title;
    task.sector = sector;
    task.stage = stage;
    task.role = role;
    task.process = process
    return task;
  }
}
function InjectLogger(name: any): (target: typeof SeederService, propertyKey: undefined, parameterIndex: 5) => void {
  throw new Error('Function not implemented.');
}

