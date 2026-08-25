import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Clinic } from './clinic.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('staff_tasks')
export class StaffTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: Staff;

  @Column({ nullable: true })
  assignedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: Staff;

  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'completedById' })
  completedBy: Staff;
}
