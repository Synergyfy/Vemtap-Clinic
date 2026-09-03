import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Branch } from './branch.entity';
import { Clinic } from './clinic.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  items: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  staffId: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column()
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

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
