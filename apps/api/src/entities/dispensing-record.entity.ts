import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Drug } from './drug.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

@Entity('dispensing_records')
export class DispensingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantityDispensed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true, length: 500 })
  notes: string;

  @Column()
  drugId: string;

  @ManyToOne(() => Drug)
  @JoinColumn({ name: 'drugId' })
  drug: Drug;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  dispensedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'dispensedById' })
  dispensedBy: Staff;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}
