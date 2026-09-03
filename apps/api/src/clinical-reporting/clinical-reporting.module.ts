import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTemplate } from '../entities/report-template.entity';
import { GeneratedReport } from '../entities/generated-report.entity';
import { ClinicalReportingService } from './clinical-reporting.service';
import { ClinicalReportingController } from './clinical-reporting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReportTemplate, GeneratedReport])],
  providers: [ClinicalReportingService],
  controllers: [ClinicalReportingController],
  exports: [ClinicalReportingService],
})
export class ClinicalReportingModule {}