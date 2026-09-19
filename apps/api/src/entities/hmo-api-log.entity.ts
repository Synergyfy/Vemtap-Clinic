import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HmoIntegration } from './hmo-integration.entity';
import { Clinic } from './clinic.entity';

export enum EndpointType {
  ELIGIBILITY_CHECK = 'eligibility_check',
  CLAIM_SUBMISSION = 'claim_submission',
  CLAIM_STATUS = 'claim_status',
  REMITTANCE_ADVICE = 'remittance_advice',
  PROVIDER_DIRECTORY = 'provider_directory',
  BENEFIT_SCHEDULE = 'benefit_schedule',
  PRE_AUTHORIZATION = 'pre_authorization',
  CLAIM_REVERSAL = 'claim_reversal',
}

export enum ApiLogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  RATE_LIMITED = 'rate_limited',
  RETRY = 'retry',
}

export enum LogDirection {
  OUTBOUND = 'outbound',
  INBOUND = 'inbound',
}

@Entity('hmo_api_logs')
export class HmoApiLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  integrationId: string;

  @ManyToOne(() => HmoIntegration)
  @JoinColumn({ name: 'integrationId' })
  integration: HmoIntegration;

  @Column({ type: 'enum', enum: EndpointType })
  endpointType: EndpointType;

  @Column({ type: 'enum', enum: LogDirection })
  direction: LogDirection;

  @Column({ type: 'text', nullable: true })
  requestUrl: string;

  @Column({ type: 'text', nullable: true })
  requestMethod: string;

  @Column({ type: 'text', nullable: true })
  requestHeaders: string;

  @Column({ type: 'text', nullable: true })
  requestBody: string;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ nullable: true })
  responseStatus: number;

  @Column({ nullable: true })
  responseHeaders: string;

  @Column({ nullable: true })
  durationMs: number;

  @Column({ type: 'enum', enum: ApiLogStatus })
  status: ApiLogStatus;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  retryCount: number;

  @Column({ nullable: true })
  correlationId: string;

  @Column({ nullable: true })
  referenceId: string;

  @Column({ nullable: true })
  referenceType: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;
}