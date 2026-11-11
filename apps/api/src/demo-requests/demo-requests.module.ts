import { Module } from '@nestjs/common';
import { DemoRequestsController } from './demo-requests.controller';
import { DemoRequestsService } from './demo-requests.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DemoRequestsController],
  providers: [DemoRequestsService],
  exports: [DemoRequestsService],
})
export class DemoRequestsModule {}
