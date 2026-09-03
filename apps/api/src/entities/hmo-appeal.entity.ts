import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMOClaim } from './hmo-claim.entity';
import { Clinic } from './clinic.entity';

export enum HMOAppealStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  UPHELD = 'upheld',
  OVERTURNED = 'overturned',
  CLOSED = 'closed',
}

@Entity('hmo_appeals')
export class HMOAppeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  appealNumber: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  disputedAmount: number;

  @Column({ type: 'enum', enum: HMOAppealStatus, default: HMOAppealStatus.SUBMITTED })
  status: HMOAppealStatus;

  @Column({ type: 'text', nullable: true })
  supportingDocuments: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ type: 'date', nullable: true })
  resolvedDate: Date;

  @Column()
  claimId: string;

  @ManyToOne(() => HMOClaim)
  @JoinColumn({ name: 'claimId' })
  claim: HMOClaim;

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
