import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Staff } from './staff.entity';

export enum ExpenseCategory {
  UTILITIES = 'utilities',
  SALARY = 'salary',
  SUPPLIES = 'supplies',
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column({ nullable: true })
  recordedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'recordedById' })
  recordedBy: Staff;

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
