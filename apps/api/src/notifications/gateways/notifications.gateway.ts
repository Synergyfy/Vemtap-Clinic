import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { socket: Socket; clinicId: string; userId: string }>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const { sub: userId, clinicId } = payload;

      this.connectedClients.set(client.id, { socket: client, clinicId, userId });
      client.join(`clinic-${clinicId}`);
      client.join(`user-${payload.sub}`);
      
      client.emit('connected', { message: 'Connected to notifications realtime' });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { clinicId: string }) {
    client.join(`clinic-${data.clinicId}`);
    return { status: 'joined', room: `clinic-${data.clinicId}` };
  }

  @SubscribeMessage('joinUserNotifications')
  handleJoinUserNotifications(@ConnectedSocket() client: Socket) {
    return { status: 'joined user room' };
  }

  emitNotification(clinicId: string, notification: any) {
    this.server.to(`clinic-${clinicId}`).emit('notification:new', notification);
  }

  emitNotificationToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification:new', notification);
  }

  emitUnreadCountUpdate(userId: string, count: number) {
    this.server.to(`user-${userId}`).emit('notification:unread-count', { count });
  }

  emitNotificationRead(notificationId: string) {
    this.server.emit('notification:read', { notificationId });
  }

  emitAnnouncement(clinicId: string, announcement: any) {
    this.server.to(`clinic-${clinicId}`).emit('announcement:new', announcement);
  }
}