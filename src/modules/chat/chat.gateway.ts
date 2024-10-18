import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  import { JwtService } from '@nestjs/jwt';
  import { UseGuards } from '@nestjs/common';
  import { AuthenticationGuard } from '../auth/authentication.guard';
  
  @WebSocketGateway({ namespace: '/chat', cors: true })
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private readonly chatService: ChatService,
      private readonly jwtService: JwtService,
    ) {}
  
    afterInit(server: Server) {
      console.log('WebSocket server initialized');
    }
  
    async handleConnection(client: Socket) {
      try {
        const token = client.handshake.query.token as string;
        const user = await this.jwtService.verifyAsync(token);
        client.data.user = user; // Armazena os dados do usuário
        console.log(`${user.username} connected`);
      } catch (error) {
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log('Client disconnected');
    }
  
    @UseGuards(AuthenticationGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() message: string,
      @ConnectedSocket() client: Socket,
    ) {
      const user = client.data.user;
      const savedMessage = await this.chatService.saveMessage(user.id, message);
      this.server.emit('receiveMessage', savedMessage);
    }
  }
  