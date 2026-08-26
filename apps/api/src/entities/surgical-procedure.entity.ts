import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';

export enum ProcedureCategory {
  CATARACT = 'cataract',
  GLAUCOMA = 'glaucoma',
  REFRACTIVE = 'refractive',
  CORNEAL = 'corneal',
  RETINAL = 'retinal',
  OCULOPLASTIC = 'oculoplastic',
  PEDIATRIC = 'pediatric',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

@Entity('surgical_procedures')
export class SurgicalProcedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProcedureCategory, default: ProcedureCategory.OTHER })
  category: ProcedureCategory;

  @Column({ type: 'int', default: 30 })
  estimatedDurationMinutes: number;

  @Column({ type: 'simple-json', nullable: true })
  requiredStaff: string[];

  @Column({ type: 'simple-json', nullable: true })
  requiredEquipment: string[];

  @Column({ type: 'simple-json', nullable: true })
  preOpRequirements: string[];

  @Column({ type: 'simple-json', nullable: true })
  postOpInstructions: string[];

  @Column({ default: true })
  isActive: boolean;

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