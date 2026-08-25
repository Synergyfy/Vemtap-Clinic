import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HMO } from '../entities/hmo.entity';
import { HMOPlan } from '../entities/hmo-plan.entity';
import { HMOAgreement } from '../entities/hmo-agreement.entity';
import { HMOClaim } from '../entities/hmo-claim.entity';
import { HMOAppeal } from '../entities/hmo-appeal.entity';
import { HMORemittance } from '../entities/hmo-remittance.entity';
import { HmoService } from './hmo.service';
import { HmoController } from './hmo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HMO, HMOPlan, HMOAgreement, HMOClaim, HMOAppeal, HMORemittance])],
  providers: [HmoService],
  controllers: [HmoController],
  exports: [HmoService],
})
export class HmoModule {}
