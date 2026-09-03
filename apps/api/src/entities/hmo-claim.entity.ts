import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMO } from './hmo.entity';
import { Patient } from './patient.entity';
import { Clinic } from './clinic.entity';

export enum HMOClaimStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PARTIALLY_APPROVED = 'partially_approved',
  DENIED = 'denied',
  APPEALED = 'appealed',
  SETTLED = 'settled',
}

@Entity('hmo_claims')
export class HMOClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  claimNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountClaimed: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountApproved: number;

  @Column({ type: 'enum', enum: HMOClaimStatus, default: HMOClaimStatus.SUBMITTED })
  status: HMOClaimStatus;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  treatmentDetails: string;

  @Column({ type: 'text', nullable: true })
  documents: string;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column({ type: 'date', nullable: true })
  submittedDate: Date;

  @Column({ type: 'date', nullable: true })
  reviewedDate: Date;

  @Column({ type: 'date', nullable: true })
  settledDate: Date;

  @Column()
  hmoId: string;

  @ManyToOne(() => HMO)
  @JoinColumn({ name: 'hmoId' })
  hmo: HMO;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

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
