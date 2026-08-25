import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMO } from './hmo.entity';
import { Clinic } from './clinic.entity';

export enum RemittanceStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  RECONCILED = 'reconciled',
  DISPUTED = 'disputed',
}

@Entity('hmo_remittances')
export class HMORemittance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  remittanceNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionDeducted: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ type: 'enum', enum: RemittanceStatus, default: RemittanceStatus.PENDING })
  status: RemittanceStatus;

  @Column({ type: 'text', nullable: true })
  claimsBreakdown: string;

  @Column({ type: 'date', nullable: true })
  periodStart: Date;

  @Column({ type: 'date', nullable: true })
  periodEnd: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

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
