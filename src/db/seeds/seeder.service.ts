import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';
import "dotenv/config";

@Injectable()
export class SeederService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly hashPasswordPipe: HashPasswordPipe, 
    ) {}

    async run(): Promise<void> {
        try {
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

            user.password = await this.hashPasswordPipe.transform(userPassword);

            await this.userRepository.save(user);

            console.log('Usuário Padrão criado com sucesso');
        } catch (error) {
            console.error('Erro ao criar o usuário padrão', error.stack);
            throw new Error('Erro ao criar o usuário padrão'); 
        }
    }
}
