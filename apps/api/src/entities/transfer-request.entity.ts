import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from './branch.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';
import { TransferItem } from './transfer-item.entity';

export enum TransferType {
  PRODUCT = 'product',
  DRUG = 'drug',
  OPTICAL = 'optical',
  MIXED = 'mixed',
}

export enum TransferStatus {
  DRAFT = 'draft',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity('transfer_requests')
export class TransferRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  transferNumber: string;

  @Column({ type: 'enum', enum: TransferType })
  type: TransferType;

  @Column()
  fromBranchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'fromBranchId' })
  fromBranch: Branch;

  @Column()
  toBranchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'toBranchId' })
  toBranch: Branch;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.DRAFT })
  status: TransferStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  requestedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: Staff;

  @Column({ nullable: true })
  requestedAt: Date;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: Staff;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ nullable: true })
  shippedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'shippedById' })
  shippedBy: Staff;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ type: 'text', nullable: true })
  shippingNotes: string;

  @Column({ nullable: true })
  receivedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'receivedById' })
  receivedBy: Staff;

  @Column({ nullable: true })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  receivingNotes: string;

  @Column({ nullable: true })
  cancelledById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'cancelledById' })
  cancelledBy: Staff;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @OneToMany(() => TransferItem, (item) => item.transferRequest)
  items: TransferItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}