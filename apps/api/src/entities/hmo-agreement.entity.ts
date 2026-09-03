import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMO } from './hmo.entity';
import { Clinic } from './clinic.entity';

@Entity('hmo_agreements')
export class HMOAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  agreementNumber: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: ['monthly', 'quarterly', 'bi-annually', 'annually'], default: 'monthly' })
  paymentCycle: string;

  @Column({ type: 'enum', enum: ['monthly', 'bi-weekly', 'weekly'], default: 'monthly' })
  claimsSubmissionSchedule: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  consultationPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  eyeTestPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  opticalFramePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lensPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  drugMarkup: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  surgeryPrice: number;

  @Column({ type: 'simple-json', nullable: true })
  billingRules: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  approvalWorkflow: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

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
