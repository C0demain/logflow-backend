import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivateMessage } from './entities/PrivateMessage.entity';
import { RoomMessage } from './entities/RoomMessage.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(PrivateMessage)
    private privateMessageRepository: Repository<PrivateMessage>,
    @InjectRepository(RoomMessage)
    private roomMessageRepository: Repository<RoomMessage>,
  ) { }

  async savePrivateMessage(senderId: string, recipientId: string, content: string) {
    const message = this.privateMessageRepository.create({
      senderId,
      recipientId,
      content,
    });
    return await this.privateMessageRepository.save(message);
  }

  async saveRoomMessage(senderId: string, roomName: string, content: string) {
    const message = this.roomMessageRepository.create({
      senderId,
      roomName,
      content,
    });
    return await this.roomMessageRepository.save(message);
  }

  async getPrivateMessages(senderId: string, recipientId: string) {
    return await this.privateMessageRepository.find({
      where: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async getRoomMessages(roomName: string) {
    return await this.roomMessageRepository.find({
      where: { roomName },
      order: { createdAt: 'ASC' },
    });
  }
}
