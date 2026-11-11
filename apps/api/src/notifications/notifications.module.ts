import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from '../entities/notification.entity';
import { Patient } from '../entities/patient.entity';
import { Staff } from '../entities/staff.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Patient, User, Staff]),
    // The gateway verifies the same access tokens as the HTTP API, so it needs
    // the same secret. A bare `JwtModule` has no secret and rejected every
    // socket connection.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
