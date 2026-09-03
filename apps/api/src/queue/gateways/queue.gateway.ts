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
  namespace: '/queue',
})
@Injectable()
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
      
      client.emit('connected', { message: 'Connected to queue realtime' });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('joinQueue')
  handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() data: { clinicId: string }) {
    client.join(`clinic-${data.clinicId}`);
    return { status: 'joined', room: `clinic-${data.clinicId}` };
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@ConnectedSocket() client: Socket, @MessageBody() data: { clinicId: string }) {
    client.leave(`clinic-${data.clinicId}`);
    return { status: 'left', room: `clinic-${data.clinicId}` };
  }

  emitQueueUpdate(clinicId: string, event: string, data: any) {
    this.server.to(`clinic-${clinicId}`).emit(event, data);
  }

  emitNewQueueEntry(clinicId: string, entry: any) {
    this.emitQueueUpdate(clinicId, 'queue:new', entry);
  }

  emitQueueUpdateEvent(clinicId: string, entry: any) {
    this.emitQueueUpdate(clinicId, 'queue:update', entry);
  }

  emitQueueCallNext(clinicId: string, entry: any) {
    this.emitQueueUpdate(clinicId, 'queue:call', entry);
  }

  emitAnnouncement(clinicId: string, announcement: any) {
    this.emitQueueUpdate(clinicId, 'queue:announcement', announcement);
  }
}