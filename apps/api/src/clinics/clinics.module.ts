import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from '../entities/clinic.entity';
import { User } from '../entities/user.entity';
import { Invoice } from '../entities/invoice.entity';
import { HMOClaim } from '../entities/hmo-claim.entity';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, User, Invoice, HMOClaim])],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
