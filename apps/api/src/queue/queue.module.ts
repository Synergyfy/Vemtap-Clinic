import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { QueueEntry } from '../entities/queue-entry.entity';
import { QueueAnnouncement } from '../entities/queue-announcement.entity';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueGateway } from './gateways/queue.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([QueueEntry, QueueAnnouncement]), JwtModule],
  providers: [QueueService, QueueGateway],
  controllers: [QueueController],
  exports: [QueueService, QueueGateway],
})
export class QueueModule {}
