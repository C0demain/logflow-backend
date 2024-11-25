import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PrivateMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: string; // ID do usuário que enviou a mensagem

  @Column()
  recipientId: string; // ID do usuário que recebeu a mensagem

  @Column()
  content: string; // Conteúdo da mensagem

  @CreateDateColumn()
  createdAt: Date; // Data e hora de envio da mensagem
}
