import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { Logger } from '@nestjs/common';
import { GroupGateway } from '../groups/group.gateway';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly groupGateway: GroupGateway,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: any, chatId: string) {
    client.join(chatId);
    return { event: 'joinChat', data: { chatId } };
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(client: any, chatId: string) {
    client.leave(chatId);
    return { event: 'leaveChat', data: { chatId } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: any,
    payload: {
      chatId: string;
      message: string;
      user: {
        sub: string;
        email: string;
        pseudo: string;
        avatar: string;
      };
    },
  ) {
    const createChatDto = {
      message: payload.message,
      groupId: payload.chatId,
    };

    const savedMessage = await this.chatsService.create(
      createChatDto,
      payload.user,
    );

    this.server.to(payload.chatId).emit('newMessage', savedMessage);
    this.groupGateway.notifyNewMessage(payload.chatId, savedMessage);

    return { event: 'sendMessage', data: savedMessage };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    client: any,
    payload: {
      chatId: string;
      user: {
        pseudo: string;
      };
      isTyping: boolean;
    },
  ) {
    // Émettre l'événement de frappe à tous les clients dans le chat sauf l'expéditeur
    client.to(payload.chatId).emit('userTyping', {
      user: payload.user,
      isTyping: payload.isTyping,
    });

    return { event: 'typing', data: payload };
  }
}
