import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Staff } from './staff.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  medication: string;

  @Column({ length: 100 })
  dosage: string;

  @Column({ length: 100 })
  frequency: string;

  @Column({ length: 100, nullable: true })
  duration: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column({ nullable: true })
  prescribedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'prescribedById' })
  prescribedBy: Staff;

  @CreateDateColumn()
  createdAt: Date;
}
