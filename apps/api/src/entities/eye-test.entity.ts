import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

@Entity('eye_tests')
export class EyeTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, length: 20 })
  rightEyeSphere: string;

  @Column({ nullable: true, length: 20 })
  leftEyeSphere: string;

  @Column({ nullable: true, length: 20 })
  rightEyeCylinder: string;

  @Column({ nullable: true, length: 20 })
  leftEyeCylinder: string;

  @Column({ nullable: true, length: 20 })
  rightEyeAxis: string;

  @Column({ nullable: true, length: 20 })
  leftEyeAxis: string;

  @Column({ nullable: true, length: 20 })
  rightEyeAdd: string;

  @Column({ nullable: true, length: 20 })
  leftEyeAdd: string;

  @Column({ nullable: true, length: 20 })
  rightEyePupil: string;

  @Column({ nullable: true, length: 20 })
  leftEyePupil: string;

  @Column({ nullable: true, length: 20 })
  rightEyeIOP: string;

  @Column({ nullable: true, length: 20 })
  leftEyeIOP: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @CreateDateColumn()
  createdAt: Date;
}
