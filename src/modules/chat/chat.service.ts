import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  // Aqui você pode adicionar a lógica para armazenar mensagens em um banco de dados
  private messages: string[] = [];

  addMessage(message: string) {
    this.messages.push(message);
  }

  getAllMessages() {
    return this.messages;
  }
}
