import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Clinic } from './clinic.entity';
import { HmoApiLog } from './hmo-api-log.entity';

export enum HmoIntegrationProvider {
  NHIF = 'nhif',
  AAR = 'aar',
  JUBILEE = 'jubilee',
  BRITAM = 'britam',
  CIC = 'cic',
  UAP = 'uap',
  MADISON = 'madison',
  HERITAGE = 'heritage',
  GA = 'ga',
  CUSTOM = 'custom',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TESTING = 'testing',
  ERROR = 'error',
}

export enum AuthType {
  API_KEY = 'api_key',
  BEARER_TOKEN = 'bearer_token',
  OAUTH2 = 'oauth2',
  BASIC_AUTH = 'basic_auth',
  CUSTOM = 'custom',
}

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

@Entity('hmo_integrations')
export class HmoIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  integrationName: string;

  @Column({ type: 'enum', enum: HmoIntegrationProvider })
  provider: HmoIntegrationProvider;

  @Column({ type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.INACTIVE })
  status: IntegrationStatus;

  @Column({ type: 'enum', enum: AuthType, default: AuthType.API_KEY })
  authType: AuthType;

  @Column({ type: 'simple-json', nullable: true })
  authConfig: Record<string, any>;

  @Column({ type: 'simple-json' })
  endpoints: Record<EndpointType, string>;

  @Column({ type: 'simple-json', nullable: true })
  requestHeaders: Record<string, string>;

  @Column({ type: 'simple-json', nullable: true })
  requestTransforms: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  responseTransforms: Record<string, any>;

  @Column({ default: 30000 })
  timeoutMs: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ type: 'simple-json', nullable: true })
  retryConfig: Record<string, any>;

  @Column({ nullable: true })
  lastTestedAt: Date;

  @Column({ nullable: true })
  lastTestStatus: string;

  @Column({ nullable: true })
  lastError: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @OneToMany(() => HmoApiLog, (log) => log.integration)
  apiLogs: HmoApiLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}