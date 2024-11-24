import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type', 'Authorization'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) { }

  private userSocketMap = new Map<string, { socketId: string; name: string }>();

  // Valida e registra o usuário na conexão
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      console.log('Connection refused: Token is missing');
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      const userId = payload.sub;
      const userName = payload.username;

      // Salva o userId no mapa
      this.userSocketMap.set(userId, { socketId: socket.id, name: userName });
      console.log(`User ${userName} (${userId}) connected with socket ${socket.id}`);
    } catch (error) {
      console.log('Connection refused: Invalid token', error.message);
      socket.disconnect();
    }
  }

  // Remove o usuário no disconnect
  handleDisconnect(socket: Socket) {
    const userId = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id)?.[0];

    if (userId) {
      this.userSocketMap.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  // Recupera usuários conectados
  @SubscribeMessage('getConnectedUsers')
  handleGetConnectedUsers(@ConnectedSocket() socket: Socket) {
    const currentUserEntry = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id);

    if (!currentUserEntry) {
      console.log('Current user not found in userSocketMap');
      return;
    }

    const currentUserId = currentUserEntry[0];

    const connectedUsers = Array.from(this.userSocketMap.entries())
      .filter(([userId]) => userId !== currentUserId) // Filtra o próprio usuário
      .map(([userId, { name }]) => ({
        id: userId,
        name,
      }));

    socket.emit('connectedUsers', connectedUsers);
  }

  // Enviar mensagens em grupo
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

    const senderEntry = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id);

    if (!senderEntry) {
      console.log(`Sender not found for socket ID: ${socket.id}`);
      return;
    }

    const [userId, sender] = senderEntry;

    const savedMessage = await this.chatService.saveRoomMessage(userId, groupName, message);

    const formattedMessage = {
      sender: sender.name, // Nome do remetente
      content: message,
      createdAt: savedMessage.createdAt,
    };

    console.log(`Message from ${sender.name} (${userId}) to group ${groupName}: ${message}`);
    socket.to(groupName).emit('message', formattedMessage);
  }

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

    const senderEntry = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id);

    if (!senderEntry) {
      console.log(`Sender not found for socket ID: ${socket.id}`);
      return;
    }

    const [senderId, sender] = senderEntry;

    const recipient = this.userSocketMap.get(toUserId);
    if (!recipient) {
      console.log(`Recipient not found for user ID: ${toUserId}`);
      return;
    }

    const formattedMessage = {
      sender: sender.name,
      recipient: recipient.name,
      content: message,
      createdAt: new Date().toISOString(),
    };

    // Salva a mensagem no banco de dados
    await this.chatService.savePrivateMessage(senderId, toUserId, message);

    socket.to(recipient.socketId).emit('privateMessage', formattedMessage);
    console.log(`Private message from ${sender.name} to ${recipient.name}: ${message}`);
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

    const senderEntry = [...this.userSocketMap.entries()]
      .find(([, value]) => value.socketId === socket.id);

    if (!senderEntry) {
      console.log(`Sender not found for socket ID: ${socket.id}`);
      return;
    }

    const [userId] = senderEntry;

    socket.join(groupName);
    console.log(`User ${userId} joined group ${groupName}`);

    const previousMessages = await this.chatService.getRoomMessages(groupName);
    socket.emit('previousMessages', previousMessages);
  }

  // Sair de um grupo
  @SubscribeMessage('leaveGroup')
  async handleLeaveGroup(
    @MessageBody() groupName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!groupName) {
      console.log('Group name is missing');
      return;
    }

    socket.leave(groupName);
    console.log(`Socket ${socket.id} left group ${groupName}`);
  }
}
