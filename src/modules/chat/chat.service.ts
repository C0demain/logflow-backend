import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  private messages: string[] = [];

  addMessage(message: string) {
    this.messages.push(message);
  }

  getAllMessages() {
    return this.messages;
  }
}
