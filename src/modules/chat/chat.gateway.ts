import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true,
  },
})
export class ChatGateway {
  private logger = new Logger(ChatGateway.name);
  private users = new Map<string, string>(); // Map de {socketId -> nome do usuário}

  @SubscribeMessage('joinGroup')
  handleJoinGroup(@MessageBody() groupName: string, @ConnectedSocket() socket: Socket) {
    socket.join(groupName); // Inscrever o socket no grupo
    this.users.set(socket.id, groupName); // Salva o grupo associado ao socketId
    this.logger.log(`User ${socket.id} joined group ${groupName}`);
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(@MessageBody() groupName: string, @ConnectedSocket() socket: Socket) {
    socket.leave(groupName); // Remove o socket do grupo
    this.users.delete(socket.id); // Remove o usuário
    this.logger.log(`User ${socket.id} left group ${groupName}`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() data: { groupName: string; message: string },
    @ConnectedSocket() socket: Socket,
  ): WsResponse<string> {
    const { groupName, message } = data;

    // Envia a mensagem para todos os membros do grupo
    socket.to(groupName).emit('message', message);
    this.logger.log(`Message sent to group ${groupName}: ${message}`);

    return { event: 'message', data: message };
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody() data: { toSocketId: string; message: string },
    @ConnectedSocket() socket: Socket,
  ): WsResponse<string> {
    const { toSocketId, message } = data;

    // Envia a mensagem privada para o destinatário especificado
    socket.to(toSocketId).emit('privateMessage', message);
    this.logger.log(`Private message from ${socket.id} to ${toSocketId}: ${message}`);

    return { event: 'privateMessage', data: message };
  }
}
