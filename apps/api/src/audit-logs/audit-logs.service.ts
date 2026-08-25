import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(@InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>) {}

  async log(data: Partial<AuditLog>): Promise<AuditLog> {
    const entry = this.auditRepo.create(data);
    return this.auditRepo.save(entry);
  }

  async findAll(query: { clinicId?: string; userId?: string; entity?: string; action?: string }): Promise<AuditLog[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    return this.auditRepo.find({ where, relations: ['user'], order: { createdAt: 'DESC' }, take: 100 });
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditRepo.findOne({ where: { id }, relations: ['user'] });
  }
}
