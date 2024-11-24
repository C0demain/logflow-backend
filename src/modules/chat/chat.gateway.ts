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
  ) {}

  private userSocketMap = new Map<string, { socketId: string; name: string }>(); // Map de userId -> { socketId, name }

  // Valida e registra o usuário na conexão
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      console.log('Connection refused: Token is missing');
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token.replace('Bearer ', '')); // Decodificar o token
      const userId = payload.sub;
      const userName = payload.username;

      // Mapear o socket com o nome do usuário
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
    const connectedUsers = Array.from(this.userSocketMap.entries()).map(([userId, { name }]) => ({
      userId,
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

  const sender = [...this.userSocketMap.entries()]
    .find(([, value]) => value.socketId === socket.id)?.[1];
  const senderName = sender?.name || 'Unknown User';

  const savedMessage = await this.chatService.saveRoomMessage(socket.id, groupName, message);

  const formattedMessage = {
    sender: senderName, // Nome do remetente
    content: message,
    createdAt: savedMessage.createdAt,
  };

  console.log(`Message from ${senderName} to group ${groupName}: ${message}`);
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

  // Obter o remetente
  const sender = [...this.userSocketMap.entries()]
    .find(([, value]) => value.socketId === socket.id)?.[1];
  if (!sender) {
    console.log(`Sender not found for socket ID: ${socket.id}`);
    return;
  }

  const senderName = sender.name || 'Unknown Sender';

  // Obter o destinatário
  const toUser = this.userSocketMap.get(toUserId);
  if (!toUser) {
    console.log(`Recipient not found for user ID: ${toUserId}`);
    return;
  }

  const recipientName = toUser.name || 'Unknown Recipient';

  // Formatar a mensagem
  const formattedMessage = {
    sender: senderName, // Nome do remetente
    recipient: recipientName, // Nome do destinatário
    content: message,
    createdAt: new Date().toISOString(),
  };

  // Enviar a mensagem para o destinatário
  socket.to(toUser.socketId).emit('privateMessage', formattedMessage);
  console.log(
    `Private message from ${senderName} to ${recipientName}: ${message}`
  );
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

    socket.join(groupName);
    console.log(`Socket ${socket.id} joined group ${groupName}`);

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
