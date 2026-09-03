import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Clinic } from './clinic.entity';

export enum CashierTransactionStatus {
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

export enum CashierPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  HMO = 'hmo',
  SPLIT = 'split',
}

export interface CashierPaymentEntry {
  method: CashierPaymentMethod | string;
  amount: number;
  reference?: string;
}

export interface CashierCartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

@Entity('cashier_transactions')
export class CashierTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  receiptNumber: string;

  @Column({ type: 'simple-json' })
  items: CashierCartItem[];

  @Column({ type: 'simple-json' })
  payments: CashierPaymentEntry[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  paid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balance: number;

  @Column({ type: 'enum', enum: CashierTransactionStatus, default: CashierTransactionStatus.COMPLETED })
  status: CashierTransactionStatus;

  @Column({ length: 100, nullable: true })
  cashierName: string;

  @Column({ nullable: true, length: 100 })
  patientName: string;

  @Column({ nullable: true, length: 500 })
  note: string;

  @Column()
  clinicId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}