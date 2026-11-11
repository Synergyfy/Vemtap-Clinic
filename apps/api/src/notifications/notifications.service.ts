import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Notification, NotificationType, NotificationChannel } from '../entities/notification.entity';
import { Patient } from '../entities/patient.entity';
import { Staff } from '../entities/staff.entity';
import { User, UserRole } from '../entities/user.entity';
import { resolvePatientProfileId } from '../common/patient-profile-access';
import { NotificationsGateway } from './gateways/notifications.gateway';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export interface CreateNotificationData extends NotificationPayload {
  userId?: string;
  patientId?: string;
  clinicId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    private readonly gateway: NotificationsGateway,
  ) {}

  /**
   * Patient tokens always identify the guardian; this resolves the family
   * profile the guardian is currently viewing (X-Patient-Id header).
   */
  async resolvePatientScope(actorId: string, requestedId?: string | null): Promise<string> {
    return resolvePatientProfileId(this.patientRepo, actorId, requestedId);
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = this.notificationRepo.create({
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.SYSTEM,
      channel: data.channel || NotificationChannel.IN_APP,
      userId: data.userId,
      patientId: data.patientId,
      clinicId: data.clinicId,
      metadata: data.metadata,
    });
    const saved = await this.notificationRepo.save(notification);

    this.emit(saved);

    return saved;
  }

  /**
   * Creates one notification per user. Fanning out keeps read/unread state
   * per person, so a clinic-wide alert is still tracked individually.
   */
  async notifyUserIds(
    userIds: string[],
    clinicId: string | null | undefined,
    data: NotificationPayload,
    excludeUserIds: string[] = [],
  ): Promise<Notification[]> {
    const excluded = new Set(excludeUserIds.filter(Boolean));
    const recipients = [...new Set(userIds.filter((id) => id && !excluded.has(id)))];
    if (recipients.length === 0) return [];

    const notifications = recipients.map((userId) =>
      this.notificationRepo.create({
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.SYSTEM,
        channel: data.channel || NotificationChannel.IN_APP,
        userId,
        clinicId: clinicId ?? undefined,
        metadata: data.metadata,
      }),
    );

    const saved = await this.notificationRepo.save(notifications);
    saved.forEach((notification) => this.emit(notification));
    return saved;
  }

  /**
   * Notifies every active staff member of a clinic who holds one of the given
   * roles (e.g. every receptionist, cashier or clinic admin).
   */
  async notifyClinicRoles(
    clinicId: string | null | undefined,
    roles: UserRole[],
    data: NotificationPayload,
    excludeUserIds: string[] = [],
  ): Promise<Notification[]> {
    if (!clinicId || roles.length === 0) return [];

    const users = await this.userRepo.find({
      where: { clinicId, role: In(roles), isActive: true },
      select: ['id'],
    });

    return this.notifyUserIds(
      users.map((user) => user.id),
      clinicId,
      data,
      excludeUserIds,
    );
  }

  /** Notifies the user account behind a Staff record (matched by email). */
  async notifyAssignedStaff(staffId: string | null | undefined, data: NotificationPayload, excludeUserIds: string[] = []) {
    if (!staffId) return [];

    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff?.email) return [];

    const user = await this.userRepo.findOne({
      where: { email: ILike(staff.email), clinicId: staff.clinicId },
      select: ['id'],
    });
    if (!user) return [];

    return this.notifyUserIds([user.id], staff.clinicId, data, excludeUserIds);
  }

  /** Platform-level alerts (e.g. demo requests) for super admins. */
  async notifySuperAdmins(data: NotificationPayload): Promise<Notification[]> {
    const users = await this.userRepo.find({
      where: { role: UserRole.SUPER_ADMIN, isActive: true },
      select: ['id'],
    });

    return this.notifyUserIds(
      users.map((user) => user.id),
      null,
      data,
    );
  }

  private emit(notification: Notification) {
    // Realtime delivery is best-effort: a socket failure must never roll back
    // the notification itself.
    try {
      if (notification.patientId) {
        this.gateway?.emitToPatient(notification.patientId, notification);
      }
      if (notification.userId) {
        this.gateway?.emitNotificationToUser(notification.userId, notification);
      }
    } catch {
      // ignore realtime failures
    }
  }

  async findByUser(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    return this.notificationRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findByPatient(patientId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { patientId };
    if (unreadOnly) where.isRead = false;
    return this.notificationRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepo.findOne({ where: { id, userId } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    await this.notificationRepo.save(notification);
    return notification;
  }

  async markPatientNotificationAsRead(
    id: string,
    actorId: string,
    requestedPatientId?: string | null,
  ): Promise<Notification> {
    const notification = await this.findPatientNotification(id, actorId, requestedPatientId);
    notification.isRead = true;
    await this.notificationRepo.save(notification);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async markAllPatientNotificationsAsRead(patientId: string): Promise<void> {
    await this.notificationRepo.update({ patientId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({ where: { userId, isRead: false } });
  }

  async getPatientUnreadCount(patientId: string): Promise<number> {
    return this.notificationRepo.count({ where: { patientId, isRead: false } });
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({ where: { id, userId } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepo.delete({ id, userId });
  }

  async removePatientNotification(id: string, actorId: string, requestedPatientId?: string | null): Promise<void> {
    const notification = await this.findPatientNotification(id, actorId, requestedPatientId);
    await this.notificationRepo.delete({ id: notification.id, patientId: notification.patientId });
  }

  /**
   * Loads a patient notification the caller is allowed to touch. Guardians may
   * manage notifications for any profile in their own family group.
   */
  private async findPatientNotification(id: string, actorId: string, requestedPatientId?: string | null) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification || !notification.patientId) {
      throw new NotFoundException('Notification not found');
    }

    const selected = await this.resolvePatientScope(actorId, requestedPatientId);
    if (notification.patientId !== selected) {
      // Fall back to the notification's own profile so a guardian can manage
      // items that arrived while another family profile was selected.
      await this.resolvePatientScope(actorId, notification.patientId);
    }

    return notification;
  }
}
