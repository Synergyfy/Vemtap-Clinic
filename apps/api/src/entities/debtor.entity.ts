import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { HMO } from './hmo.entity';
import { Invoice } from './invoice.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';
import { PaymentPlan } from './payment-plan.entity';
import { CollectionActivity } from './collection-activity.entity';

export enum DebtorType {
  PATIENT = 'patient',
  HMO = 'hmo',
}

export enum DebtorStatus {
  ACTIVE = 'active',
  ON_PLAN = 'on_plan',
  IN_COLLECTION = 'in_collection',
  SETTLED = 'settled',
  WRITE_OFF = 'write_off',
}

@Entity('debtors')
export class Debtor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  debtorNumber: string;

  @Column({ type: 'enum', enum: DebtorType })
  type: DebtorType;

  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  hmoId: string;

  @ManyToOne(() => HMO, { nullable: true })
  @JoinColumn({ name: 'hmoId' })
  hmo: HMO;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalOutstanding: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overdue30: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overdue60: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overdue90: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overdue120Plus: number;

  @Column({ type: 'enum', enum: DebtorStatus, default: DebtorStatus.ACTIVE })
  status: DebtorStatus;

  @Column({ nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  lastPaymentAmount: number;

  @Column({ nullable: true })
  assignedCollectorId: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'assignedCollectorId' })
  assignedCollector: Staff;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date', nullable: true })
  nextFollowUpDate: Date;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @OneToMany(() => PaymentPlan, (plan) => plan.debtor)
  paymentPlans: PaymentPlan[];

  @OneToMany(() => CollectionActivity, (activity) => activity.debtor)
  collectionActivities: CollectionActivity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}