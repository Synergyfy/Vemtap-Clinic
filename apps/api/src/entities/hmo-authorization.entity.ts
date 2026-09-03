import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMO } from './hmo.entity';
import { HMOPlan } from './hmo-plan.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum AuthorizationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled',
}

export enum AuthorizationType {
  CONSULTATION = 'consultation',
  EYE_TEST = 'eye_test',
  OPTICAL = 'optical',
  DRUG = 'drug',
  SURGERY = 'surgery',
  PROCEDURE = 'procedure',
}

@Entity('hmo_authorizations')
export class HMOAuthorization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  authorizationNumber: string;

  @Column({ type: 'enum', enum: AuthorizationType })
  serviceType: AuthorizationType;

  @Column({ type: 'text', nullable: true })
  clinicalJustification: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'enum', enum: AuthorizationStatus, default: AuthorizationStatus.PENDING })
  status: AuthorizationStatus;

  @Column({ nullable: true, length: 50 })
  hmoReferenceNumber: string;

  @Column({ type: 'text', nullable: true })
  hmoNotes: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ nullable: true, length: 500 })
  rejectionReason: string;

  @Column({ type: 'simple-json', nullable: true })
  documents: string[];

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  hmoId: string;

  @ManyToOne(() => HMO)
  @JoinColumn({ name: 'hmoId' })
  hmo: HMO;

  @Column({ nullable: true })
  planId: string;

  @ManyToOne(() => HMOPlan, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: HMOPlan;

  @Column({ nullable: true })
  requestedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: Staff;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: Staff;

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
