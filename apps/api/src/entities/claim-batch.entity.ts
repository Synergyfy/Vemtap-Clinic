import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { HMO } from './hmo.entity';
import { Clinic } from './clinic.entity';
import { HMOClaim } from './hmo-claim.entity';

export enum ClaimBatchStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Entity('claim_batches')
export class ClaimBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  batchNumber: string;

  @Column({ type: 'enum', enum: ClaimBatchStatus, default: ClaimBatchStatus.DRAFT })
  status: ClaimBatchStatus;

  @Column({ type: 'int', default: 0 })
  totalClaims: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  approvedAmount: number;

  @Column({ type: 'date', nullable: true })
  periodStart: Date;

  @Column({ type: 'date', nullable: true })
  periodEnd: Date;

  @Column({ type: 'date', nullable: true })
  submittedDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column()
  hmoId: string;

  @ManyToOne(() => HMO)
  @JoinColumn({ name: 'hmoId' })
  hmo: HMO;

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
