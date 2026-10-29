import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Patient } from './patient.entity';
import { Clinic } from './clinic.entity';

export enum FileCategory {
  PATIENT_DOCUMENT = 'patient_document',
  PRESCRIPTION = 'prescription',
  CLAIM_DOCUMENT = 'claim_document',
  REMITTANCE = 'remittance',
  GENERAL = 'general',
}

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  originalName: string;

  // Cloudinary public_id, or the path relative to the upload dir for local storage
  @Column({ length: 255 })
  storedName: string;

  @Column({ length: 20, nullable: true })
  storageProvider: string;

  // Cloudinary resource type ('image' | 'raw')
  @Column({ length: 20, nullable: true })
  resourceType: string;

  @Column({ length: 20, nullable: true })
  format: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ type: 'enum', enum: FileCategory, default: FileCategory.GENERAL })
  category: FileCategory;

  @Column({ length: 500, nullable: true })
  url: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ length: 100, nullable: true })
  relatedEntityType: string;

  @Column()
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}