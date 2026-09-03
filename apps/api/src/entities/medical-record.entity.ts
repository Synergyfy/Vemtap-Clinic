import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Branch } from './branch.entity';
import { Clinic } from './clinic.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'text', nullable: true })
  historyOfPresentIllness: string;

  @Column({ type: 'text', nullable: true })
  pastMedicalHistory: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  treatmentPlan: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

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
