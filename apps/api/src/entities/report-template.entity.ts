import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Staff } from './staff.entity';

export enum ReportType {
  PATIENT_VOLUME = 'patient_volume',
  APPOINTMENT_UTILIZATION = 'appointment_utilization',
  REVENUE_SUMMARY = 'revenue_summary',
  HMO_CLAIMS_ANALYSIS = 'hmo_claims_analysis',
  SURGERY_SCHEDULE = 'surgery_schedule',
  DRUG_USAGE = 'drug_usage',
  PATIENT_OUTCOMES = 'patient_outcomes',
  STAFF_PRODUCTIVITY = 'staff_productivity',
  INVENTORY_LEVELS = 'inventory_levels',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'simple-json', nullable: true })
  queryConfig: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  defaultParameters: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  parameterSchema: Record<string, any>;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.PDF })
  defaultFormat: ReportFormat;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isScheduled: boolean;

  @Column({ nullable: true })
  cronExpression: string;

  @Column({ nullable: true })
  scheduledFormat: ReportFormat;

  @Column({ type: 'simple-json', nullable: true })
  scheduledParameters: Record<string, any>;

  @Column({ nullable: true })
  lastRunAt: Date;

  @Column({ nullable: true })
  nextRunAt: Date;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: Staff;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}