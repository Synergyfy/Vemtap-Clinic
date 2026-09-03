import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Debtor } from './debtor.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum CollectionActivityType {
  PHONE_CALL = 'phone_call',
  EMAIL = 'email',
  SMS = 'sms',
  LETTER = 'letter',
  IN_PERSON = 'in_person',
  PAYMENT_RECEIVED = 'payment_received',
  PROMISE_TO_PAY = 'promise_to_pay',
  DISPUTE = 'dispute',
  LEGAL_ACTION = 'legal_action',
  WRITE_OFF = 'write_off',
}

export enum CollectionOutcome {
  SUCCESSFUL = 'successful',
  UNSUCCESSFUL = 'unsuccessful',
  PROMISED = 'promised',
  DISPUTED = 'disputed',
  NO_CONTACT = 'no_contact',
  RESCHEDULED = 'rescheduled',
}

@Entity('collection_activities')
export class CollectionActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  debtorId: string;

  @ManyToOne(() => Debtor)
  @JoinColumn({ name: 'debtorId' })
  debtor: Debtor;

  @Column({ type: 'enum', enum: CollectionActivityType })
  activityType: CollectionActivityType;

  @Column({ type: 'enum', enum: CollectionOutcome, nullable: true })
  outcome: CollectionOutcome;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amountPromised: number;

  @Column({ type: 'date', nullable: true })
  promiseDate: Date;

  @Column({ nullable: true })
  performedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy: Staff;

  @Column({ type: 'date', nullable: true })
  nextActionDate: Date;

  @Column({ type: 'text', nullable: true })
  nextActionNotes: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}