import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateSupportTicketDto, SupportTicketPriority, SupportTicketStatus, SupportTicketType } from './dto';

export interface SupportTicketRecord {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  type: SupportTicketType;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  clinicId: string;
  reporterId?: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

@Injectable()
export class SupportTicketsService {
  private readonly tickets = new Map<string, SupportTicketRecord>();

  private generateTicketNumber(): string {
    return `ST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private normalizeStatus(status?: string): SupportTicketStatus {
    switch (status) {
      case SupportTicketStatus.RESOLVED:
        return SupportTicketStatus.RESOLVED;
      case SupportTicketStatus.CLOSED:
        return SupportTicketStatus.CLOSED;
      case SupportTicketStatus.IN_PROGRESS:
        return SupportTicketStatus.IN_PROGRESS;
      default:
        return SupportTicketStatus.OPEN;
    }
  }

  findAll(clinicId?: string): SupportTicketRecord[] {
    const items = [...this.tickets.values()];
    if (!clinicId) return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return items
      .filter((ticket) => ticket.clinicId === clinicId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getStats(clinicId?: string) {
    const items = this.findAll(clinicId);
    return {
      total: items.length,
      open: items.filter((ticket) => ticket.status === SupportTicketStatus.OPEN).length,
      inProgress: items.filter((ticket) => ticket.status === SupportTicketStatus.IN_PROGRESS).length,
      resolved: items.filter((ticket) => ticket.status === SupportTicketStatus.RESOLVED).length,
      closed: items.filter((ticket) => ticket.status === SupportTicketStatus.CLOSED).length,
      byPriority: {
        low: items.filter((ticket) => ticket.priority === SupportTicketPriority.LOW).length,
        medium: items.filter((ticket) => ticket.priority === SupportTicketPriority.MEDIUM).length,
        high: items.filter((ticket) => ticket.priority === SupportTicketPriority.HIGH).length,
        critical: items.filter((ticket) => ticket.priority === SupportTicketPriority.CRITICAL).length,
      },
    };
  }

  create(dto: CreateSupportTicketDto): SupportTicketRecord {
    const now = new Date().toISOString();
    const record: SupportTicketRecord = {
      id: randomUUID(),
      ticketNumber: this.generateTicketNumber(),
      subject: dto.subject,
      description: dto.description,
      type: dto.type ?? SupportTicketType.SUPPORT,
      priority: dto.priority ?? SupportTicketPriority.MEDIUM,
      status: SupportTicketStatus.OPEN,
      clinicId: dto.clinicId,
      reporterId: dto.reporterId,
      reporterName: dto.reporterName,
      assigneeId: dto.assigneeId,
      clinicName: dto.clinicId ? 'Clinic' : undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.tickets.set(record.id, record);
    return record;
  }

  resolve(id: string, notes?: string): SupportTicketRecord {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      throw new Error(`Support ticket ${id} not found`);
    }

    ticket.status = SupportTicketStatus.RESOLVED;
    ticket.resolutionNotes = notes ?? ticket.resolutionNotes;
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }

  close(id: string): SupportTicketRecord {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      throw new Error(`Support ticket ${id} not found`);
    }

    ticket.status = SupportTicketStatus.CLOSED;
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }
}
