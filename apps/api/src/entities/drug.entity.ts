import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, length: 200 })
  genericName: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 50 })
  dosageForm: string;

  @Column({ length: 50 })
  strength: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int', default: 0 })
  quantityInStock: number;

  @Column({ type: 'int', default: 10 })
  reorderLevel: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true, length: 100 })
  manufacturer: string;

  @Column({ nullable: true, length: 100 })
  supplier: string;

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
