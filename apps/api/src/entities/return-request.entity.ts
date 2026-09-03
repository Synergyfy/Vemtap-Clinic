import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';
import { Invoice } from './invoice.entity';
import { DispensingRecord } from './dispensing-record.entity';
import { OpticalInventoryItem } from './optical-inventory-item.entity';
import { Product } from './product.entity';
import { Refund } from './refund.entity';

export enum ReturnType {
  PRODUCT = 'product',
  DRUG = 'drug',
  OPTICAL = 'optical',
}

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  PATIENT_DECIDED = 'patient_decided',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  WRONG_PRESCRIPTION = 'wrong_prescription',
  OTHER = 'other',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  returnNumber: string;

  @Column({ type: 'enum', enum: ReturnType })
  type: ReturnType;

  @Column({ nullable: true })
  invoiceId: string;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'enum', enum: ReturnReason })
  reason: ReturnReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json' })
  items: ReturnItem[];

  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.REQUESTED })
  status: ReturnStatus;

  @Column({ nullable: true })
  reviewedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: Staff;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: Staff;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  receivedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'receivedById' })
  receivedBy: Staff;

  @Column({ nullable: true })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  receivedNotes: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @OneToMany(() => Refund, (refund) => refund.returnRequest)
  refunds: Refund[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface ReturnItem {
  itemType: 'product' | 'drug' | 'optical';
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  serialNumber?: string;
}