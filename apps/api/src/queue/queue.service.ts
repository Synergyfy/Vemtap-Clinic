import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntry, QueueStatus } from '../entities/queue-entry.entity';
import { QueueAnnouncement, AnnouncementType } from '../entities/queue-announcement.entity';
import { CreateQueueEntryDto, UpdateQueueEntryDto, QueueQueryDto } from './dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntry)
    private queueRepository: Repository<QueueEntry>,
    @InjectRepository(QueueAnnouncement)
    private announcementRepository: Repository<QueueAnnouncement>,
  ) {}

  async create(dto: CreateQueueEntryDto): Promise<QueueEntry> {
    const lastEntry = await this.queueRepository.findOne({
      where: { branchId: dto.branchId, clinicId: dto.clinicId },
      order: { ticketNumber: 'DESC' },
    });
    const ticketNumber = (lastEntry?.ticketNumber || 0) + 1;

    const entry = this.queueRepository.create({ ...dto, ticketNumber });
    return this.queueRepository.save(entry);
  }

  async findAll(query: QueueQueryDto): Promise<QueueEntry[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.status) where.status = query.status;
    if (query.station) where.station = query.station;
    return this.queueRepository.find({ where, relations: ['patient', 'branch'], order: { ticketNumber: 'ASC' } });
  }

  async findOne(id: string): Promise<QueueEntry> {
    const entry = await this.queueRepository.findOne({ where: { id }, relations: ['patient', 'branch', 'clinic'] });
    if (!entry) throw new NotFoundException('Queue entry not found');
    return entry;
  }

  async callNext(clinicId: string, branchId: string): Promise<QueueEntry | null> {
    const next = await this.queueRepository.findOne({
      where: { clinicId, branchId, status: QueueStatus.WAITING },
      order: { ticketNumber: 'ASC' },
    });
    if (!next) return null;
    next.status = QueueStatus.IN_PROGRESS;
    next.calledAt = new Date();
    return this.queueRepository.save(next);
  }

  async complete(id: string): Promise<QueueEntry> {
    const entry = await this.findOne(id);
    entry.status = QueueStatus.COMPLETED;
    entry.completedAt = new Date();
    return this.queueRepository.save(entry);
  }

  async cancel(id: string): Promise<QueueEntry> {
    const entry = await this.findOne(id);
    entry.status = QueueStatus.CANCELLED;
    return this.queueRepository.save(entry);
  }

  async getStats(clinicId: string) {
    const waiting = await this.queueRepository.count({ where: { clinicId, status: QueueStatus.WAITING } });
    const inProgress = await this.queueRepository.count({ where: { clinicId, status: QueueStatus.IN_PROGRESS } });
    const completed = await this.queueRepository.count({ where: { clinicId, status: QueueStatus.COMPLETED } });
    return { waiting, inProgress, completed };
  }

  async createAnnouncement(data: { message: string; type?: string; targetQueueType?: string; clinicId: string; staffId?: string }): Promise<QueueAnnouncement> {
    const announcement = this.announcementRepository.create({
      ...data,
      type: (data.type as AnnouncementType) || AnnouncementType.GENERAL,
    });
    return this.announcementRepository.save(announcement);
  }

  async findAnnouncements(clinicId: string): Promise<QueueAnnouncement[]> {
    return this.announcementRepository.find({ where: { clinicId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async resetQueue(clinicId: string): Promise<{ deleted: number }> {
    const result = await this.queueRepository.delete({ clinicId });
    return { deleted: result.affected || 0 };
  }
}
