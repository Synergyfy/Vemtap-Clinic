import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clinic } from './clinic.entity';
import { SubscriptionInvoice } from './subscription-invoice.entity';

export enum SubscriptionPaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum SubscriptionPaymentProvider {
  PAYSTACK = 'paystack',
  MANUAL = 'manual',
}

@Entity('subscription_payments')
export class SubscriptionPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => SubscriptionInvoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: SubscriptionInvoice;

  @Column({ type: 'uuid' })
  clinicId: string;

  @ManyToOne(() => Clinic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 30, default: 'paystack' })
  method: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPaymentProvider,
    default: SubscriptionPaymentProvider.PAYSTACK,
  })
  provider: SubscriptionPaymentProvider;

  @Column({ type: 'varchar', unique: true, nullable: true, length: 120 })
  reference: string | null;

  @Column({
    type: 'enum',
    enum: SubscriptionPaymentStatus,
    default: SubscriptionPaymentStatus.PENDING,
  })
  status: SubscriptionPaymentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  recordedById: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
