import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ReportTemplate, ReportType, ReportFormat } from '../entities/report-template.entity';
import { GeneratedReport, ReportStatus, ReportDeliveryMethod } from '../entities/generated-report.entity';
import {
  CreateReportTemplateDto, UpdateReportTemplateDto, ReportTemplateQueryDto,
  GenerateReportDto, GeneratedReportQueryDto,
} from './dto';

@Injectable()
export class ClinicalReportingService {
  constructor(
    @InjectRepository(ReportTemplate) private templateRepo: Repository<ReportTemplate>,
    @InjectRepository(GeneratedReport) private reportRepo: Repository<GeneratedReport>,
  ) {}

  // ========== Templates ==========
  async createTemplate(dto: CreateReportTemplateDto, clinicId: string, createdById: string): Promise<ReportTemplate> {
    const template = this.templateRepo.create({ ...dto, clinicId, createdById });
    return this.templateRepo.save(template);
  }

  async findTemplates(query: ReportTemplateQueryDto): Promise<ReportTemplate[]> {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.isScheduled !== undefined) where.isScheduled = query.isScheduled;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.templateRepo.find({ where, relations: ['createdBy'], order: { name: 'ASC' } });
  }

  async findTemplateById(id: string): Promise<ReportTemplate> {
    const template = await this.templateRepo.findOne({ where: { id }, relations: ['createdBy', 'clinic'] });
    if (!template) throw new NotFoundException('Report template not found');
    return template;
  }

  async updateTemplate(id: string, dto: UpdateReportTemplateDto): Promise<ReportTemplate> {
    const template = await this.findTemplateById(id);
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.findTemplateById(id);
    await this.templateRepo.remove(template);
  }

  // ========== Generated Reports ==========
  async generateReport(dto: GenerateReportDto, clinicId: string, generatedById: string): Promise<GeneratedReport> {
    const template = await this.templateRepo.findOne({ where: { id: dto.templateId, clinicId } });
    if (!template) throw new NotFoundException('Report template not found');

    const report = this.reportRepo.create({
      templateId: dto.templateId,
      parameters: dto.parameters || template.defaultParameters || {},
      format: dto.format || template.defaultFormat,
      status: ReportStatus.PENDING,
      deliveryMethod: dto.deliveryMethod || ReportDeliveryMethod.DOWNLOAD,
      deliveryTarget: dto.deliveryTarget,
      generatedById,
      clinicId,
    });
    const saved = await this.reportRepo.save(report);

    // Process asynchronously (in production, use a queue)
    this.processReport(saved.id).catch(console.error);

    return saved;
  }

  async findReports(query: GeneratedReportQueryDto): Promise<GeneratedReport[]> {
    const where: any = {};
    if (query.templateId) where.templateId = query.templateId;
    if (query.status) where.status = query.status;
    if (query.generatedById) where.generatedById = query.generatedById;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.reportRepo.find({ where, relations: ['template', 'generatedBy'], order: { createdAt: 'DESC' } });
  }

  async findReportById(id: string): Promise<GeneratedReport> {
    const report = await this.reportRepo.findOne({ where: { id }, relations: ['template', 'generatedBy', 'clinic'] });
    if (!report) throw new NotFoundException('Generated report not found');
    return report;
  }

  async deleteReport(id: string): Promise<void> {
    const report = await this.findReportById(id);
    await this.reportRepo.remove(report);
  }

  // ========== Report Processing ==========
  private async processReport(reportId: string): Promise<void> {
    const report = await this.reportRepo.findOne({ where: { id: reportId }, relations: ['template'] });
    if (!report) return;

    report.status = ReportStatus.GENERATING;
    await this.reportRepo.save(report);

    try {
      // Generate report data based on template type
      const data = await this.executeTemplateQuery(report.template, report.parameters);

      // Generate file (PDF/Excel/CSV/JSON)
      const { fileUrl, fileSize } = await this.generateFile(data, report.format, report.template.name);

      report.status = ReportStatus.COMPLETED;
      report.fileUrl = fileUrl;
      report.fileSize = fileSize;
      report.completedAt = new Date();
      await this.reportRepo.save(report);

      // Handle delivery (email, etc.)
      if (report.deliveryMethod !== ReportDeliveryMethod.DOWNLOAD) {
        await this.deliverReport(report);
      }
    } catch (error) {
      report.status = ReportStatus.FAILED;
      report.errorMessage = error.message;
      await this.reportRepo.save(report);
    }
  }

  private async executeTemplateQuery(template: ReportTemplate, parameters: Record<string, any>): Promise<any[]> {
    // In production, this would execute actual queries based on template.type
    // For now, return mock data structure
    switch (template.type) {
      case ReportType.REVENUE_SUMMARY:
        return [{ metric: 'Total Revenue', value: 1250000 }, { metric: 'HMO Revenue', value: 450000 }];
      case ReportType.PATIENT_VOLUME:
        return [{ period: '2026-01', newPatients: 45, returning: 120 }];
      case ReportType.APPOINTMENT_UTILIZATION:
        return [{ doctor: 'Dr. Smith', utilization: 85 }, { doctor: 'Dr. Jones', utilization: 72 }];
      default:
        return [];
    }
  }

  private async generateFile(data: any[], format: ReportFormat, name: string): Promise<{ fileUrl: string; fileSize: number }> {
    // In production, use libraries like pdfkit, exceljs, etc.
    const content = JSON.stringify(data, null, 2);
    const fileName = `${name}-${Date.now()}.${format}`;
    return { fileUrl: `/reports/${fileName}`, fileSize: Buffer.byteLength(content) };
  }

  private async deliverReport(report: GeneratedReport): Promise<void> {
    // In production, send email or push to API
    console.log(`Delivering report ${report.id} via ${report.deliveryMethod} to ${report.deliveryTarget}`);
  }

  // ========== Scheduled Reports ==========
  async getScheduledTemplates(): Promise<ReportTemplate[]> {
    return this.templateRepo.find({ where: { isScheduled: true, isActive: true } });
  }

  async getStats(clinicId: string): Promise<{ totalTemplates: number; totalReports: number; byStatus: Record<string, number> }> {
    const templates = await this.templateRepo.count({ where: { clinicId } });
    const reports = await this.reportRepo.find({ where: { clinicId } });
    const byStatus: Record<string, number> = {};
    for (const r of reports) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }
    return { totalTemplates: templates, totalReports: reports.length, byStatus };
  }
}