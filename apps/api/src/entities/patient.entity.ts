import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Branch } from './branch.entity';
import { HMO } from './hmo.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'] })
  gender: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 200 })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  state: string;

  @Column({ nullable: true, length: 100 })
  nationality: string;

  @Column({ nullable: true, length: 100 })
  occupation: string;

  @Column({ type: 'enum', enum: ['private', 'hmo'], default: 'private' })
  patientType: string;

  @Column({ nullable: true })
  hmoId: string;

  @ManyToOne(() => HMO, { nullable: true })
  @JoinColumn({ name: 'hmoId' })
  hmo: HMO;

  @Column({ nullable: true, length: 100 })
  hmoName: string;

  @Column({ nullable: true, length: 100 })
  hmoNumber: string;

  @Column({ nullable: true, length: 100 })
  emergencyContact: string;

  @Column({ nullable: true, length: 20 })
  emergencyPhone: string;

  @Column({ nullable: true, length: 5 })
  bloodGroup: string;

  @Column({ nullable: true, length: 10 })
  genotype: string;

  @Column({ nullable: true, length: 500 })
  allergies: string;

  @Column({ nullable: true, select: false })
  patientPassword: string;

  @Column({ nullable: true })
  patientPin: string;

  @Column({ default: false })
  portalAccessEnabled: boolean;

  @Column({ type: 'enum', enum: ['new', 'active', 'inactive'], default: 'new' })
  status: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column()
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}