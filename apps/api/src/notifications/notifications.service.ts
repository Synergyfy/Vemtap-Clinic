import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationChannel } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
  ) {}

  async create(data: {
    title: string;
    message: string;
    type?: NotificationType;
    channel?: NotificationChannel;
    userId?: string;
    patientId?: string;
    clinicId?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
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
    return this.notificationRepo.save(notification);
  }

  async findByUser(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    return this.notificationRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findByPatient(patientId: string): Promise<Notification[]> {
    return this.notificationRepo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (notification) {
      notification.isRead = true;
      await this.notificationRepo.save(notification);
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({ where: { userId, isRead: false } });
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepo.delete(id);
  }
}
