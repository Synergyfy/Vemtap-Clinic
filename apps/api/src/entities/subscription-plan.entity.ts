import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PlanReportingLevel = 'basic' | 'advanced' | 'bi' | 'custom';

/**
 * Limits are stored as JSON so a new metered resource can be added without a
 * migration. `null` means unlimited for numeric limits.
 */
export interface PlanLimits {
  maxBranches: number | null;
  maxStaff: number | null;
  maxPatients: number | null;
  ocrPerMonth: number | null;
  whatsappPerMonth: number | null;
  storageMb: number | null;
  optical: boolean;
  reporting: PlanReportingLevel;
  apiIntegrations: boolean;
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  yearlyPrice: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'jsonb', default: () => `'{}'` })
  limits: PlanLimits;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  features: string[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
