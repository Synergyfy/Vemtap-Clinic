import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Clinic } from './clinic.entity';

@Entity('clinic_settings')
@Unique(['clinicId', 'key'])
export class ClinicSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ length: 50, default: 'general' })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
