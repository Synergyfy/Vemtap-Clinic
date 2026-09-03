import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransferRequest } from './transfer-request.entity';
import { Product } from './product.entity';
import { Drug } from './drug.entity';
import { OpticalInventoryItem } from './optical-inventory-item.entity';
import { Clinic } from './clinic.entity';

export enum ItemType {
  PRODUCT = 'product',
  DRUG = 'drug',
  OPTICAL = 'optical',
}

@Entity('transfer_items')
export class TransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transferRequestId: string;

  @ManyToOne(() => TransferRequest, (t) => t.items)
  @JoinColumn({ name: 'transferRequestId' })
  transferRequest: TransferRequest;

  @Column({ type: 'enum', enum: ItemType })
  itemType: ItemType;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  drugId: string;

  @ManyToOne(() => Drug, { nullable: true })
  @JoinColumn({ name: 'drugId' })
  drug: Drug;

  @Column({ nullable: true })
  opticalItemId: string;

  @ManyToOne(() => OpticalInventoryItem, { nullable: true })
  @JoinColumn({ name: 'opticalItemId' })
  opticalItem: OpticalInventoryItem;

  @Column({ type: 'int' })
  quantityRequested: number;

  @Column({ type: 'int', default: 0 })
  quantityShipped: number;

  @Column({ type: 'int', default: 0 })
  quantityReceived: number;

  @Column({ nullable: true, length: 100 })
  batchNumber: string;

  @Column({ nullable: true, length: 100 })
  serialNumber: string;

  @Column({ nullable: true, length: 100 })
  expiryDate: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}