import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Branch } from './branch.entity';
import { Clinic } from './clinic.entity';

export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('queue_entries')
export class QueueEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  ticketNumber: number;

  @Column({ type: 'enum', enum: QueueStatus, default: QueueStatus.WAITING })
  status: QueueStatus;

  @Column({ nullable: true, length: 50 })
  station: string;

  @Column({ nullable: true, length: 100 })
  priority: string;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  calledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

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
