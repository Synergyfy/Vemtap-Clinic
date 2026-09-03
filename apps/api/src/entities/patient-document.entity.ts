import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

@Entity('patient_documents')
export class PatientDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  fileName: string;

  @Column({ length: 500 })
  fileUrl: string;

  @Column({ length: 100 })
  fileType: string;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @Column({ length: 100, nullable: true })
  documentType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  uploadedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: Staff;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}
