import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clinic } from './clinic.entity';
import { ClinicSubscription } from './clinic-subscription.entity';

export enum SubscriptionEventType {
  CREATED = 'created',
  UPGRADED = 'upgraded',
  DOWNGRADED = 'downgraded',
  RENEWED = 'renewed',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  GRACE_STARTED = 'grace_started',
  EXPIRED = 'expired',
  PAYMENT_FAILED = 'payment_failed',
  LIMIT_REACHED = 'limit_reached',
  REMINDER_SENT = 'reminder_sent',
  OVERRIDE = 'override',
}

/** Append-only audit trail for every subscription state change. */
@Entity('subscription_events')
export class SubscriptionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clinicId: string;

  @ManyToOne(() => Clinic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId: string | null;

  @ManyToOne(() => ClinicSubscription, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: ClinicSubscription | null;

  @Column({ type: 'enum', enum: SubscriptionEventType })
  type: SubscriptionEventType;

  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
