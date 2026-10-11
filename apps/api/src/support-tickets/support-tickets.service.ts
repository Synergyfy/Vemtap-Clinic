import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, SupportTicketMessage, TicketStatus, TicketPriority, TicketType } from '../entities/support-ticket.entity';
import { CreateSupportTicketDto, UpdateSupportTicketDto, SupportTicketQueryDto, CreateTicketMessageDto, AssignTicketDto, ResolveTicketDto } from './dto';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportTicketMessage)
    private messageRepository: Repository<SupportTicketMessage>,
  ) {}

  async create(dto: CreateSupportTicketDto, reporterId: string): Promise<SupportTicket> {
    const ticket = this.ticketRepository.create({
      ...dto,
      reporterId,
      status: TicketStatus.OPEN,
      priority: dto.priority || TicketPriority.MEDIUM,
      type: dto.type || TicketType.SUPPORT,
    });
    return this.ticketRepository.save(ticket);
  }

  async findAll(query: SupportTicketQueryDto): Promise<SupportTicket[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.type) where.type = query.type;
    if (query.reporterId) where.reporterId = query.reporterId;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.search) {
      where.subject = { $ilike: `%${query.search}%` };
    }
    return this.ticketRepository.find({ 
      where, 
      relations: ['reporter', 'assignee', 'clinic', 'messages', 'messages.author'],
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({ 
      where: { id }, 
      relations: ['reporter', 'assignee', 'clinic', 'messages', 'messages.author'] 
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateSupportTicketDto, userId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    if (dto.status === TicketStatus.RESOLVED && ticket.status !== TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    }
    Object.assign(ticket, dto);
    return this.ticketRepository.save(ticket);
  }

  async assign(id: string, dto: AssignTicketDto, userId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    ticket.assigneeId = dto.assigneeId;
    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }
    return this.ticketRepository.save(ticket);
  }

  async resolve(id: string, dto: ResolveTicketDto, userId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();
    if (dto.resolutionNotes) {
      await this.addMessage(id, { content: dto.resolutionNotes, ticketId: id, clinicId: ticket.clinicId }, userId);
    }
    return this.ticketRepository.save(ticket);
  }

  async close(id: string, userId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    ticket.status = TicketStatus.CLOSED;
    return this.ticketRepository.save(ticket);
  }

  async reopen(id: string, userId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    ticket.status = TicketStatus.REOPENED;
    ticket.resolvedAt = null;
    return this.ticketRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }

  async addMessage(ticketId: string, dto: CreateTicketMessageDto, authorId: string): Promise<SupportTicketMessage> {
    const ticket = await this.findOne(ticketId);
    const message = this.messageRepository.create({
      ...dto,
      authorId,
      ticketId,
    });
    return this.messageRepository.save(message);
  }

  async getMessages(ticketId: string): Promise<SupportTicketMessage[]> {
    return this.messageRepository.find({ 
      where: { ticketId }, 
      relations: ['author'], 
      order: { createdAt: 'ASC' } 
    });
  }

  async getStats(clinicId: string) {
    const tickets = await this.ticketRepository.find({ where: { clinicId } });
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const t of tickets) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      byType[t.type] = (byType[t.type] || 0) + 1;
    }
    return { total: tickets.length, byStatus, byPriority, byType };
  }
}