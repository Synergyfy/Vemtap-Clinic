import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Clinic } from './clinic.entity';

export enum LensOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('lens_orders')
export class LensOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  lensType: string;

  @Column({ nullable: true, length: 200 })
  frameDescription: string;

  @Column({ nullable: true, length: 20 })
  rightEyeSphere: string;

  @Column({ nullable: true, length: 20 })
  leftEyeSphere: string;

  @Column({ nullable: true, length: 20 })
  rightEyeCylinder: string;

  @Column({ nullable: true, length: 20 })
  leftEyeCylinder: string;

  @Column({ nullable: true, length: 20 })
  rightEyeAxis: string;

  @Column({ nullable: true, length: 20 })
  leftEyeAxis: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: LensOrderStatus, default: LensOrderStatus.PENDING })
  status: LensOrderStatus;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

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
