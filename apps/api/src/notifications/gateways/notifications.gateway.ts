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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';

const allowedOrigins = () =>
  (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      // Requests without an Origin (native apps, server-to-server) are allowed;
      // browsers must come from one of the configured CORS_ORIGIN entries.
      if (!origin || allowedOrigins().includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<
    string,
    { clinicId: string; userId: string; isPatient: boolean }
  >();

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Patient) private readonly patientRepo: Repository<Patient>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const { sub: userId, clinicId } = payload;
      const isPatient = payload.type === 'patient';

      this.connectedClients.set(client.id, { clinicId, userId, isPatient });
      client.join(`user-${userId}`);

      if (isPatient) {
        // The token belongs to the patient account (the guardian). The web app
        // re-subscribes to the selected family profile via joinPatientProfile.
        // Patients must not join the clinic-wide room, or they would receive
        // every staff notification for that clinic.
        client.join(`patient-${userId}`);
      } else if (clinicId) {
        client.join(`clinic-${clinicId}`);
      }

      client.emit('connected', { message: 'Connected to notifications realtime' });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { clinicId?: string }) {
    const identity = this.connectedClients.get(client.id);
    if (!identity || identity.isPatient || !identity.clinicId) {
      return { status: 'forbidden' };
    }

    // Never trust a clinic id sent by the client: a staff member may only
    // listen to their own clinic's room.
    if (data?.clinicId && data.clinicId !== identity.clinicId) {
      return { status: 'forbidden' };
    }

    client.join(`clinic-${identity.clinicId}`);
    return { status: 'joined', room: `clinic-${identity.clinicId}` };
  }

  @SubscribeMessage('joinUserNotifications')
  handleJoinUserNotifications(@ConnectedSocket() client: Socket) {
    return { status: 'joined user room' };
  }

  @SubscribeMessage('joinPatientProfile')
  async handleJoinPatientProfile(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { patientId?: string },
  ) {
    const identity = this.connectedClients.get(client.id);
    if (!identity) {
      return { status: 'unauthorized' };
    }

    const requestedId = String(data?.patientId ?? '').trim() || identity.userId;
    if (!(await this.canAccessPatient(identity.userId, requestedId))) {
      return { status: 'forbidden' };
    }

    for (const room of client.rooms) {
      if (room.startsWith('patient-')) {
        client.leave(room);
      }
    }
    client.join(`patient-${requestedId}`);

    return { status: 'joined', patientId: requestedId };
  }

  emitNotification(clinicId: string, notification: any) {
    if (notification?.userId) {
      this.emitNotificationToUser(notification.userId, notification);
      return;
    }

    if (clinicId) {
      this.server.to(`clinic-${clinicId}`).emit('notification:new', notification);
    }
  }

  emitNotificationToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification:new', notification);
  }

  emitToPatient(patientId: string, notification: any) {
    if (!this.server || !patientId) return;
    this.server.to(`patient-${patientId}`).emit('notification:new', notification);
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

  /** Guardians may subscribe to their own profile or any dependent's. */
  private async canAccessPatient(actorId: string, targetId: string): Promise<boolean> {
    if (actorId === targetId) return true;

    const [actor, target] = await Promise.all([
      this.patientRepo.findOne({ where: { id: actorId } }),
      this.patientRepo.findOne({ where: { id: targetId } }),
    ]);
    if (!actor || !target) return false;

    return (actor.guardianId ?? actor.id) === (target.guardianId ?? target.id);
  }
}