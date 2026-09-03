import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';

export enum CurrencyCode {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

@Entity('currency_configs')
export class CurrencyConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CurrencyCode, unique: true })
  code: CurrencyCode;

  @Column({ length: 10 })
  symbol: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20 })
  locale: string;

  @Column({ type: 'decimal', precision: 12, scale: 6, default: 1 })
  exchangeRateToBase: number;

  @Column({ default: false })
  isBase: boolean;

  @Column({ default: true })
  isActive: boolean;

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