import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './chat.entity';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async saveMessage(userId: string, content: string): Promise<Message> {
    // Busca o usuário pelo ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Cria a mensagem com a relação de usuário
    const message = this.messageRepository.create({
      user, // Associa o usuário à mensagem
      content,
    });

    return await this.messageRepository.save(message);
  }

  async getMessages(): Promise<Message[]> {
    return await this.messageRepository.find({
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
