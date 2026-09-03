import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentPlan } from './payment-plan.entity';
import { Clinic } from './clinic.entity';

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  WAIVED = 'waived',
}

@Entity('payment_plan_installments')
export class PaymentPlanInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentPlanId: string;

  @ManyToOne(() => PaymentPlan)
  @JoinColumn({ name: 'paymentPlanId' })
  paymentPlan: PaymentPlan;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountDue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ nullable: true })
  paidDate: Date;

  @Column({ type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.PENDING })
  status: InstallmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

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