import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  state: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 100 })
  email: string;

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
