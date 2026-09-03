import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

@Entity('vitals')
export class Vitals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bloodPressureSystolic: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bloodPressureDiastolic: number;

  @Column({ type: 'int', nullable: true })
  heartRate: number;

  @Column({ type: 'int', nullable: true })
  respiratoryRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  oxygenSaturation: number;

  @Column({ nullable: true, length: 20 })
  bloodGroup: string;

  @Column()
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @CreateDateColumn()
  createdAt: Date;
}
