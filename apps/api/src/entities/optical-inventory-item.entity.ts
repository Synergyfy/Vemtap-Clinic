import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';

@Entity('optical_inventory_items')
export class OpticalInventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, length: 100 })
  brand: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 50 })
  type: string;

  @Column({ nullable: true, length: 50 })
  frameSize: string;

  @Column({ nullable: true, length: 50 })
  lensType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int', default: 0 })
  quantityInStock: number;

  @Column({ type: 'int', default: 5 })
  reorderLevel: number;

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
