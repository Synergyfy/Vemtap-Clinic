import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SurgicalProcedure } from './surgical-procedure.entity';
import { OperatingRoom } from './operating-room.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum SurgeryStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

@Entity('surgery_schedules')
export class SurgerySchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  surgeryNumber: string;

  @Column()
  procedureId: string;

  @ManyToOne(() => SurgicalProcedure)
  @JoinColumn({ name: 'procedureId' })
  procedure: SurgicalProcedure;

  @Column()
  operatingRoomId: string;

  @ManyToOne(() => OperatingRoom)
  @JoinColumn({ name: 'operatingRoomId' })
  operatingRoom: OperatingRoom;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  primarySurgeonId: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'primarySurgeonId' })
  primarySurgeon: Staff;

  @Column({ type: 'simple-json', nullable: true })
  assistantSurgeonIds: string[];

  @Column({ type: 'simple-json', nullable: true })
  anesthesiologistIds: string[];

  @Column({ type: 'simple-json', nullable: true })
  nurseIds: string[];

  @Column({ type: 'timestamp' })
  scheduledStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledEndTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'enum', enum: SurgeryStatus, default: SurgeryStatus.SCHEDULED })
  status: SurgeryStatus;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'text', nullable: true })
  preoperativeNotes: string;

  @Column({ type: 'text', nullable: true })
  intraoperativeNotes: string;

  @Column({ type: 'text', nullable: true })
  postoperativeNotes: string;

  @Column({ type: 'text', nullable: true })
  complications: string;

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