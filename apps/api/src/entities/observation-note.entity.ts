import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum ObservationCategory {
  GENERAL = 'general',
  VITALS = 'vitals',
  TREATMENT = 'treatment',
  FOLLOW_UP = 'follow_up',
  ALLERGY = 'allergy',
  ADVERSE_REACTION = 'adverse_reaction',
  OTHER = 'other',
}

@Entity('observation_notes')
export class ObservationNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  note: string;

  @Column({ type: 'enum', enum: ObservationCategory, default: ObservationCategory.GENERAL })
  category: ObservationCategory;

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
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}