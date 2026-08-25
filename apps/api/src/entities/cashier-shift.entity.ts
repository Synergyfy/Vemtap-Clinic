import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum ShiftStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('cashier_shifts')
export class CashierShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  shiftNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  closingBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  expectedBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  variance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCashReceived: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCardReceived: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalTransferReceived: number;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.OPEN })
  status: ShiftStatus;

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column()
  staffId: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

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
