import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReturnRequest } from './return-request.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum RefundMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  ORIGINAL_PAYMENT = 'original_payment',
  STORE_CREDIT = 'store_credit',
}

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  refundNumber: string;

  @Column()
  returnRequestId: string;

  @ManyToOne(() => ReturnRequest)
  @JoinColumn({ name: 'returnRequestId' })
  returnRequest: ReturnRequest;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: RefundMethod, default: RefundMethod.ORIGINAL_PAYMENT })
  method: RefundMethod;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @Column({ nullable: true, length: 200 })
  transactionReference: string;

  @Column({ nullable: true })
  processedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'processedById' })
  processedBy: Staff;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}