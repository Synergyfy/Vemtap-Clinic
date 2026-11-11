import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Unique } from 'typeorm';

/**
 * Platform-wide (cross-clinic) configuration used by the super admin console.
 * Clinic-scoped configuration lives in `clinic_settings`.
 */
@Entity('app_settings')
@Unique(['key'])
export class AppSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
