import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), JwtModule],
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
