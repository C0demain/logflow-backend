import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class RoomMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: string; // ID do usuário que enviou a mensagem

  @Column()
  roomName: string; // Nome da sala onde a mensagem foi enviada

  @Column()
  content: string; // Conteúdo da mensagem

  @CreateDateColumn()
  createdAt: Date; // Data e hora de envio da mensagem
}
