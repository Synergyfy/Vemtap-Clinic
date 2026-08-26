import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { OpticalInventoryItem } from './optical-inventory-item.entity';
import { Clinic } from './clinic.entity';

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum SalePaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  HMO = 'hmo',
  SPLIT = 'split',
}

@Entity('optical_sales')
export class OpticalSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  saleNumber: string;

  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  inventoryItemId: string;

  @ManyToOne(() => OpticalInventoryItem, { nullable: true })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: OpticalInventoryItem;

  @Column({ nullable: true })
  lensOrderId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.PENDING })
  status: SaleStatus;

  @Column({ type: 'enum', enum: SalePaymentMethod, default: SalePaymentMethod.CASH })
  paymentMethod: SalePaymentMethod;

  @Column({ nullable: true, length: 100 })
  paymentReference: string;

  @Column({ nullable: true })
  cashierId: string;

  @Column()
  clinicId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}