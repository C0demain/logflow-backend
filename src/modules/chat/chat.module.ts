import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { PrivateMessage } from './entities/PrivateMessage.entity';
import { RoomMessage } from './entities/RoomMessage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivateMessage, RoomMessage]), // Registra as entidades no módulo
  ],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
