import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Staff } from './staff.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketType {
  SUPPORT = 'support',
  COMPLAINT = 'complaint',
  INCIDENT = 'incident',
  FEATURE_REQUEST = 'feature_request',
}

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketType, default: TicketType.SUPPORT })
  type: TicketType;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ nullable: true })
  reporterId: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'reporterId' })
  reporter: Staff;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: Staff;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SupportTicketMessage, message => message.ticket)
  messages: SupportTicketMessage[];
}

@Entity('support_ticket_messages')
export class SupportTicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  authorId: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'authorId' })
  author: Staff;

  @Column()
  ticketId: string;

  @ManyToOne(() => SupportTicket, ticket => ticket.messages)
  @JoinColumn({ name: 'ticketId' })
  ticket: SupportTicket;

  @CreateDateColumn()
  createdAt: Date;
}