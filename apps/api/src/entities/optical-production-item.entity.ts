import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LensOrder } from './lens-order.entity';
import { OpticalInventoryItem } from './optical-inventory-item.entity';
import { Clinic } from './clinic.entity';

export enum ProductionStage {
  RECEIVED = 'received',
  LENS_CUTTING = 'lens_cutting',
  EDGING = 'edging',
  COATING = 'coating',
  ASSEMBLY = 'assembly',
  QUALITY_CHECK = 'quality_check',
  READY_FOR_PICKUP = 'ready_for_pickup',
  COMPLETED = 'completed',
}

@Entity('optical_production_items')
export class OpticalProductionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lensOrderId: string;

  @ManyToOne(() => LensOrder)
  @JoinColumn({ name: 'lensOrderId' })
  lensOrder: LensOrder;

  @Column({ nullable: true })
  inventoryItemId: string;

  @ManyToOne(() => OpticalInventoryItem, { nullable: true })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: OpticalInventoryItem;

  @Column({ type: 'enum', enum: ProductionStage, default: ProductionStage.RECEIVED })
  stage: ProductionStage;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column({ nullable: true })
  technicianId: string;

  @Column({ type: 'date', nullable: true })
  startedAt: Date;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @Column()
  clinicId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}