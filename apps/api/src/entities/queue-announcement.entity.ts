import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Staff } from './staff.entity';

export enum AnnouncementType {
  GENERAL = 'general',
  EMERGENCY = 'emergency',
  SYSTEM = 'system',
  CALL_PATIENT = 'call_patient',
}

@Entity('queue_announcements')
export class QueueAnnouncement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: AnnouncementType, default: AnnouncementType.GENERAL })
  type: AnnouncementType;

  @Column({ nullable: true })
  targetQueueType: string;

  @Column({ nullable: true })
  staffId: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}