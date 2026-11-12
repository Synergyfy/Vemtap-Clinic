import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patient_family_invitations')
export class PatientFamilyInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guardianId: string;

  @Column({ type: 'uuid', nullable: true })
  clinicId: string | null;

  // Dependent profile created up-front so the guardian can use it immediately.
  @Column({ type: 'uuid', nullable: true })
  patientId: string | null;

  @Column({ length: 200 })
  fullName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50 })
  relationship: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
