import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Clinic } from './clinic.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  entity: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'simple-json', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  newValues: Record<string, any>;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true, length: 100 })
  ipAddress: string;

  @Column({ nullable: true, length: 500 })
  userAgent: string;

  @Column({ nullable: true })
  clinicId: string;

  @ManyToOne(() => Clinic, { nullable: true })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}
