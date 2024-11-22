import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  private userSocketMap = new Map<string, { socketId: string; name: string }>(); // Map de userId -> { socketId, name }

  // Registrar o usuário no mapa
  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { userId: string; name: string },
    @ConnectedSocket() socket: Socket,
  ) {
    if (!data.userId || !data.name) {
      console.log('Invalid registration data');
      return;
    }

    this.userSocketMap.set(data.userId, { socketId: socket.id, name: data.name });
    console.log(`User ${data.name} (${data.userId}) connected with socket ${socket.id}`);
  }

  // Lidar com a desconexão de usuários
  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(`Socket ${socket.id} connected`);

    socket.on('disconnect', () => {
      const userId = [...this.userSocketMap.entries()]
        .find(([, value]) => value.socketId === socket.id)?.[0];
      if (userId) {
        this.userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  }

  // Enviar mensagem para um grupo
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { groupName: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { groupName, message } = data;

    if (!groupName || !message) {
      console.log('Group name or message content is missing');
      return;
    }

    // Obter o nome do usuário pelo socketId
    const user = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id)?.[1];
    const userName = user?.name || 'Unknown User';

    // Salvar a mensagem no banco de dados
    const savedMessage = await this.chatService.saveRoomMessage(
      socket.id,
      groupName,
      message,
    );

    // Formatar a mensagem antes de enviá-la
    const formattedMessage = {
      sender: socket.id,
      name: userName,
      content: message,
      createdAt: savedMessage.createdAt,
    };

    console.log(`Socket ${socket.id} (${userName}) sent a message to group ${groupName}: ${message}`);

    // Enviar a mensagem para todos no grupo, exceto o remetente
    socket.to(groupName).emit('message', formattedMessage);
  }

  // Enviar mensagem privada
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { toUserId: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { toUserId, message } = data;

    if (!toUserId || !message) {
      console.log('Recipient userId or message content is missing');
      return;
    }

    const toUser = this.userSocketMap.get(toUserId);
    const sender = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id)?.[1];
    const senderName = sender?.name || 'Unknown User';

    if (toUser) {
      // Salvar mensagem privada no banco de dados
      const savedMessage = await this.chatService.savePrivateMessage(
        socket.id,
        toUserId,
        message,
      );

      // Formatar a mensagem antes de enviá-la
      const formattedMessage = {
        sender: socket.id,
        name: senderName,
        content: message,
        createdAt: savedMessage.createdAt,
      };

      socket.to(toUser.socketId).emit('privateMessage', formattedMessage);
      console.log(`Private message sent from ${socket.id} (${senderName}) to ${toUserId}: ${message}`);
    } else {
      console.log(`User ${toUserId} is not connected`);
    }
  }

  // Entrar em um grupo
  @SubscribeMessage('joinGroup')
  async handleJoinGroup(
    @MessageBody() groupName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!groupName) {
      console.log('Group name is missing');
      return;
    }

    socket.join(groupName); // Registrar o socket no grupo
    console.log(`Socket ${socket.id} joined group ${groupName}`);

    // Recuperar mensagens anteriores do grupo para sincronizar com o novo usuário
    const previousMessages = await this.chatService.getRoomMessages(groupName);

    // Enviar mensagens anteriores apenas para o usuário que acabou de entrar
    socket.emit('previousMessages', previousMessages);
  }

  // Sair de um grupo
  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(
    @MessageBody() groupName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!groupName) {
      console.log('Group name is missing');
      return;
    }

    socket.leave(groupName); // Remover o socket do grupo
    console.log(`Socket ${socket.id} left group ${groupName}`);
  }
}
