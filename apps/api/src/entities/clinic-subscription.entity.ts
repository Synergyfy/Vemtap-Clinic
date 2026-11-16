import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clinic } from './clinic.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  GRACE = 'grace',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * One row per clinic. The subscription belongs to the clinic organization, not
 * to a staff member, so staff changes never affect billing.
 */
@Entity('clinic_subscriptions')
export class ClinicSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  clinicId: string;

  @ManyToOne(() => Clinic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ type: 'uuid' })
  planId: string;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  /** A downgrade requested mid-period is applied on renewal. */
  @Column({ type: 'uuid', nullable: true })
  pendingPlanId: string | null;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'pendingPlanId' })
  pendingPlan: SubscriptionPlan | null;

  @Column({ type: 'enum', enum: BillingCycle, nullable: true })
  pendingBillingCycle: BillingCycle | null;

  /**
   * True when the pending plan is an upgrade waiting for payment, so the sweep
   * must not apply it at the period boundary. False for a scheduled downgrade.
   */
  @Column({ default: false })
  pendingPlanAwaitingPayment: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodStart: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  renewalDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  graceEndsAt: Date | null;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  /** Price of the current plan at the time it was subscribed, for billing history. */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  priceSnapshot: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
