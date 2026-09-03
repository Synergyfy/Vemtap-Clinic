import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index(['tokenHash'], { unique: true })
@Index(['userId'])
@Index(['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'replaced_by', type: 'uuid', nullable: true })
  replacedBy: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'ip', type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isActive(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }
}