import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

export enum UsageMetric {
  PATIENTS = 'patients',
  STAFF = 'staff',
  BRANCHES = 'branches',
  OCR = 'ocr',
  WHATSAPP = 'whatsapp',
  STORAGE_MB = 'storage_mb',
}

/**
 * Metered usage per clinic per billing period (`period` is `YYYY-MM`).
 * Counters are incremented by `SubscriptionsService.recordUsage`.
 */
@Entity('usage_counters')
@Index(['clinicId', 'metric', 'period'], { unique: true })
export class UsageCounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clinicId: string;

  @Column({ type: 'enum', enum: UsageMetric })
  metric: UsageMetric;

  @Column({ length: 7 })
  period: string;

  @Column({ type: 'int', default: 0 })
  used: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
