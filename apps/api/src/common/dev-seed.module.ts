import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevSeedService } from './dev-seed.service';
import { User } from '../entities/user.entity';
import { Clinic } from '../entities/clinic.entity';
import { Branch } from '../entities/branch.entity';
import { Staff } from '../entities/staff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Clinic, Branch, Staff]),
  ],
  providers: [
    DevSeedService,
  ],
  exports: [
    DevSeedService,
  ],
})
export class DevSeedModule {}