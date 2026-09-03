import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Debtor } from './debtor.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';
import { PaymentPlanInstallment } from './payment-plan-installment.entity';

export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

@Entity('payment_plans')
export class PaymentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  planNumber: string;

  @Column()
  debtorId: string;

  @ManyToOne(() => Debtor)
  @JoinColumn({ name: 'debtorId' })
  debtor: Debtor;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountRemaining: number;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column({ type: 'int', default: 0 })
  installmentsPaid: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: PaymentPlanStatus, default: PaymentPlanStatus.ACTIVE })
  status: PaymentPlanStatus;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: Staff;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @OneToMany(() => PaymentPlanInstallment, (installment) => installment.paymentPlan)
  installments: PaymentPlanInstallment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}