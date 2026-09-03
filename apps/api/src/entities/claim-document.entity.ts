import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HMOClaim } from './hmo-claim.entity';

@Entity('claim_documents')
export class ClaimDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  fileName: string;

  @Column({ length: 500 })
  fileUrl: string;

  @Column({ length: 100 })
  fileType: string;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @Column({ length: 100, nullable: true })
  documentType: string;

  @Column()
  claimId: string;

  @ManyToOne(() => HMOClaim)
  @JoinColumn({ name: 'claimId' })
  claim: HMOClaim;

  @CreateDateColumn()
  createdAt: Date;
}
