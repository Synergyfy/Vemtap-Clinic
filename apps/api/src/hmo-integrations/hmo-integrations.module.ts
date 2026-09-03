import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { HmoIntegration } from '../entities/hmo-integration.entity';
import { HmoApiLog } from '../entities/hmo-api-log.entity';
import { HmoIntegrationsService } from './hmo-integrations.service';
import { HmoIntegrationsController } from './hmo-integrations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HmoIntegration, HmoApiLog]), HttpModule],
  providers: [HmoIntegrationsService],
  controllers: [HmoIntegrationsController],
  exports: [HmoIntegrationsService],
})
export class HmoIntegrationsModule {}