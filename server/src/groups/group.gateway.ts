import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/groups',
})
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GroupGateway.name);
  private userGroups: Map<string, Set<string>> = new Map(); // userId -> Set<groupId>

  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    // Nettoyer les groupes de l'utilisateur
    for (const [userId, groups] of this.userGroups.entries()) {
      if (groups.has(client.id)) {
        groups.delete(client.id);
        if (groups.size === 0) {
          this.userGroups.delete(userId);
        }
      }
    }
  }

  @SubscribeMessage('joinGroups')
  async handleJoinGroups(
    client: any,
    payload: { userId: string; groupIds: string[] },
  ) {
    if (!this.userGroups.has(payload.userId)) {
      this.userGroups.set(payload.userId, new Set());
    }

    const userGroups = this.userGroups.get(payload.userId)!;
    payload.groupIds.forEach((groupId) => {
      userGroups.add(groupId);
      client.join(groupId);
    });

    return { event: 'joinedGroups', data: { groupIds: payload.groupIds } };
  }

  @SubscribeMessage('leaveGroup')
  async handleLeaveGroup(
    client: any,
    payload: { userId: string; groupId: string },
  ) {
    const userGroups = this.userGroups.get(payload.userId);
    if (userGroups) {
      userGroups.delete(payload.groupId);
      client.leave(payload.groupId);
    }

    return { event: 'leftGroup', data: { groupId: payload.groupId } };
  }

  // Méthode pour notifier les utilisateurs d'un nouveau message
  notifyNewMessage(groupId: string, message: any) {
    this.server.to(groupId).emit('newGroupMessage', {
      groupId,
      message,
    });
  }
}
