import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMO } from './hmo.entity';

@Entity('hmo_plans')
export class HMOPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  consultationCopay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  eyeTestCopay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  opticalCopay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  drugCopay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  surgeryCopay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  consultationCoverage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  eyeTestCoverage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  opticalCoverage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  drugCoverage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  surgeryCoverage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  annualLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monthlyLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  opticalAllowance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  drugAllowance: number;

  @Column({ type: 'simple-json', nullable: true })
  excludedServices: string[];

  @Column({ default: true })
  requiresAuthorization: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  hmoId: string;

  @ManyToOne(() => HMO)
  @JoinColumn({ name: 'hmoId' })
  hmo: HMO;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
