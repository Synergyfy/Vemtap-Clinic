import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReportTemplate, ReportFormat } from './report-template.entity';
import { Staff } from './staff.entity';
import { Clinic } from './clinic.entity';

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportDeliveryMethod {
  DOWNLOAD = 'download',
  EMAIL = 'email',
  API = 'api',
}

@Entity('generated_reports')
export class GeneratedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  templateId: string;

  @ManyToOne(() => ReportTemplate)
  @JoinColumn({ name: 'templateId' })
  template: ReportTemplate;

  @Column({ type: 'simple-json', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'enum', enum: ReportFormat })
  format: ReportFormat;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ nullable: true, length: 500 })
  fileUrl: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  generatedById: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'generatedById' })
  generatedBy: Staff;

  @Column({ nullable: true })
  deliveryMethod: ReportDeliveryMethod;

  @Column({ nullable: true, length: 500 })
  deliveryTarget: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}