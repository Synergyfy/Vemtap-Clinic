import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Branch } from './branch.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CLINIC_ADMIN = 'clinic_admin',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  PHARMACIST = 'pharmacist',
  OPTOMETRIST = 'optometrist',
  CASHIER = 'cashier',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 30 })
  phone: string | null;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLINIC_ADMIN })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  clinicId: string | null;

  @ManyToOne(() => Clinic, { nullable: true })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ nullable: true })
  branchId: string | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
