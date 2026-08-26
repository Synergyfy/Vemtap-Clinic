import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, retry, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { HmoIntegration, HmoIntegrationProvider, IntegrationStatus, AuthType, EndpointType } from '../entities/hmo-integration.entity';
import { HmoApiLog, ApiLogStatus, LogDirection } from '../entities/hmo-api-log.entity';
import {
  CreateHmoIntegrationDto, UpdateHmoIntegrationDto, HmoIntegrationQueryDto,
  TestIntegrationDto, EligibilityCheckDto, ClaimSubmissionDto, RemittanceParseDto, HmoApiLogQueryDto,
} from './dto';

@Injectable()
export class HmoIntegrationsService {
  constructor(
    @InjectRepository(HmoIntegration) private integrationRepo: Repository<HmoIntegration>,
    @InjectRepository(HmoApiLog) private logRepo: Repository<HmoApiLog>,
    private httpService: HttpService,
  ) {}

  // ========== Integrations ==========
  async createIntegration(dto: CreateHmoIntegrationDto, clinicId: string): Promise<HmoIntegration> {
    const integration = this.integrationRepo.create({
      ...dto,
      clinicId,
      status: dto.status || IntegrationStatus.INACTIVE,
      authType: dto.authType || AuthType.API_KEY,
    });
    return this.integrationRepo.save(integration);
  }

  async findIntegrations(query: HmoIntegrationQueryDto): Promise<HmoIntegration[]> {
    const where: any = {};
    if (query.provider) where.provider = query.provider;
    if (query.status) where.status = query.status;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.integrationRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findIntegrationById(id: string): Promise<HmoIntegration> {
    const integration = await this.integrationRepo.findOne({ where: { id }, relations: ['clinic'] });
    if (!integration) throw new NotFoundException('HMO integration not found');
    return integration;
  }

  async updateIntegration(id: string, dto: UpdateHmoIntegrationDto): Promise<HmoIntegration> {
    const integration = await this.findIntegrationById(id);
    Object.assign(integration, dto);
    return this.integrationRepo.save(integration);
  }

  async deleteIntegration(id: string): Promise<void> {
    const integration = await this.findIntegrationById(id);
    await this.integrationRepo.remove(integration);
  }

  // ========== Testing ==========
  async testIntegration(id: string, dto: TestIntegrationDto): Promise<{ success: boolean; response?: any; error?: string; durationMs: number }> {
    const integration = await this.findIntegrationById(id);
    const startTime = Date.now();

    try {
      const response = await this.callHmoEndpoint(integration, dto.endpointType, dto.testPayload || {});
      const durationMs = Date.now() - startTime;

      await this.logApiCall({
        integrationId: id,
        endpointType: dto.endpointType,
        direction: LogDirection.OUTBOUND,
        requestUrl: integration.endpoints[dto.endpointType],
        requestMethod: 'POST',
        requestBody: JSON.stringify(dto.testPayload || {}),
        responseStatus: 200,
        responseBody: JSON.stringify(response),
        durationMs,
        status: ApiLogStatus.SUCCESS,
        clinicId: integration.clinicId,
      });

      return { success: true, response, durationMs };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      await this.logApiCall({
        integrationId: id,
        endpointType: dto.endpointType,
        direction: LogDirection.OUTBOUND,
        requestUrl: integration.endpoints[dto.endpointType],
        requestMethod: 'POST',
        requestBody: JSON.stringify(dto.testPayload || {}),
        responseStatus: error.response?.status,
        responseBody: JSON.stringify(error.response?.data),
        durationMs,
        status: ApiLogStatus.FAILED,
        errorMessage: error.message,
        clinicId: integration.clinicId,
      });

      return { success: false, error: error.message, durationMs };
    }
  }

  // ========== API Operations ==========
  async checkEligibility(integrationId: string, dto: EligibilityCheckDto): Promise<any> {
    const integration = await this.findIntegrationById(integrationId);
    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Integration is not active');
    }

    const payload = this.transformRequest(integration.requestTransforms?.[EndpointType.ELIGIBILITY_CHECK], dto);
    return this.callHmoEndpoint(integration, EndpointType.ELIGIBILITY_CHECK, payload);
  }

  async submitClaim(integrationId: string, dto: ClaimSubmissionDto): Promise<any> {
    const integration = await this.findIntegrationById(integrationId);
    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Integration is not active');
    }

    const payload = this.transformRequest(integration.requestTransforms?.[EndpointType.CLAIM_SUBMISSION], dto);
    return this.callHmoEndpoint(integration, EndpointType.CLAIM_SUBMISSION, payload);
  }

  async checkClaimStatus(integrationId: string, claimId: string): Promise<any> {
    const integration = await this.findIntegrationById(integrationId);
    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Integration is not active');
    }

    const payload = this.transformRequest(integration.requestTransforms?.[EndpointType.CLAIM_STATUS], { claimId });
    return this.callHmoEndpoint(integration, EndpointType.CLAIM_STATUS, payload);
  }

  async parseRemittance(integrationId: string, dto: RemittanceParseDto): Promise<any> {
    const integration = await this.findIntegrationById(integrationId);
    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new BadRequestException('Integration is not active');
    }

    const payload = this.transformRequest(integration.requestTransforms?.[EndpointType.REMITTANCE_ADVICE], dto);
    return this.callHmoEndpoint(integration, EndpointType.REMITTANCE_ADVICE, payload);
  }

  // ========== Internal Helpers ==========
  private async callHmoEndpoint(integration: HmoIntegration, endpointType: EndpointType, payload: any): Promise<any> {
    const url = integration.endpoints[endpointType];
    if (!url) throw new BadRequestException(`Endpoint ${endpointType} not configured`);

    const headers = this.buildHeaders(integration);
    const transformedPayload = this.applyTransform(integration.requestTransforms?.[endpointType], payload);

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= integration.maxRetries; attempt++) {
      try {
        const response: any = await firstValueFrom(
          this.httpService.post(url, transformedPayload, { headers, timeout: integration.timeoutMs }).pipe(
            timeout(integration.timeoutMs),
            catchError((error: AxiosError) => {
              lastError = error;
              throw error;
            })
          )
        );

        await this.logApiCall({
          integrationId: integration.id,
          endpointType,
          direction: LogDirection.OUTBOUND,
          requestUrl: url,
          requestMethod: 'POST',
          requestHeaders: JSON.stringify(headers),
          requestBody: JSON.stringify(transformedPayload),
          responseStatus: response.status,
          responseBody: JSON.stringify(response.data),
          durationMs: Date.now() - startTime,
          status: ApiLogStatus.SUCCESS,
          clinicId: integration.clinicId,
        });

        return this.applyTransform(integration.responseTransforms?.[endpointType], response.data);
      } catch (error) {
        const axiosError = error as AxiosError;
        lastError = axiosError;

        await this.logApiCall({
          integrationId: integration.id,
          endpointType,
          direction: LogDirection.OUTBOUND,
          requestUrl: url,
          requestMethod: 'POST',
          requestHeaders: JSON.stringify(headers),
          requestBody: JSON.stringify(transformedPayload),
          responseStatus: axiosError.response?.status,
          responseBody: axiosError.response?.data ? JSON.stringify(axiosError.response.data) : undefined,
          durationMs: Date.now() - startTime,
          status: axiosError.code === 'ECONNABORTED' ? ApiLogStatus.TIMEOUT :
                 axiosError.response?.status === 429 ? ApiLogStatus.RATE_LIMITED :
                 ApiLogStatus.FAILED,
          errorMessage: axiosError.message,
          clinicId: integration.clinicId,
        });

        if (attempt < integration.maxRetries && this.isRetryableError(axiosError)) {
          await this.delay(this.calculateBackoff(attempt, integration.retryConfig));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  private buildHeaders(integration: HmoIntegration): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...integration.requestHeaders,
    };

    switch (integration.authType) {
      case AuthType.API_KEY:
        if (integration.authConfig?.apiKey) {
          headers['X-API-Key'] = integration.authConfig.apiKey;
        }
        break;
      case AuthType.BEARER_TOKEN:
        if (integration.authConfig?.apiKey) {
          headers['Authorization'] = `Bearer ${integration.authConfig.apiKey}`;
        }
        break;
      case AuthType.BASIC_AUTH:
        if (integration.authConfig?.username && integration.authConfig?.password) {
          headers['Authorization'] = `Basic ${Buffer.from(`${integration.authConfig.username}:${integration.authConfig.password}`).toString('base64')}`;
        }
        break;
      case AuthType.OAUTH2:
        // In production, would fetch/refresh token
        if (integration.authConfig?.apiKey) {
          headers['Authorization'] = `Bearer ${integration.authConfig.apiKey}`;
        }
        break;
    }

    return headers;
  }

  private transformRequest(transforms: Record<string, any> | undefined, payload: any): any {
    if (!transforms) return payload;
    // Simple field mapping transform
    if (transforms.fieldMapping) {
      const mapped: any = {};
      for (const [target, source] of Object.entries(transforms.fieldMapping)) {
        const value = this.getNestedValue(payload, source as string);
        if (value !== undefined) this.setNestedValue(mapped, target as string, value);
      }
      return { ...payload, ...mapped };
    }
    return payload;
  }

  private applyTransform(transforms: Record<string, any> | undefined, payload: any): any {
    if (!transforms) return payload;
    if (transforms.fieldMapping) {
      const mapped: any = {};
      for (const [target, source] of Object.entries(transforms.fieldMapping)) {
        const value = this.getNestedValue(payload, source as string);
        if (value !== undefined) this.setNestedValue(mapped, target as string, value);
      }
      return { ...payload, ...mapped };
    }
    return payload;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  private isRetryableError(error: AxiosError): boolean {
    if (error.code === 'ECONNABORTED') return true; // Timeout
    if (error.response?.status === 429) return true; // Rate limited
    if (error.response?.status && error.response.status >= 500) return true; // Server error
    return false;
  }

  private calculateBackoff(attempt: number, retryConfig: Record<string, any> | undefined): number {
    const baseDelay = retryConfig?.baseDelay || 1000;
    const maxDelay = retryConfig?.maxDelay || 30000;
    const factor = retryConfig?.factor || 2;
    const delay = Math.min(baseDelay * Math.pow(factor, attempt), maxDelay);
    return delay + Math.random() * 1000; // Jitter
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== Logging ==========
  private async logApiCall(data: Partial<HmoApiLog>): Promise<void> {
    const log = this.logRepo.create(data);
    await this.logRepo.save(log);
  }

  // ========== Logs ==========
  async findLogs(query: HmoApiLogQueryDto): Promise<HmoApiLog[]> {
    const where: any = {};
    if (query.integrationId) where.integrationId = query.integrationId;
    if (query.endpointType) where.endpointType = query.endpointType;
    if (query.direction) where.direction = query.direction;
    if (query.status) where.status = query.status;
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.correlationId) where.correlationId = query.correlationId;
    return this.logRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async findLogById(id: string): Promise<HmoApiLog> {
    const log = await this.logRepo.findOne({ where: { id }, relations: ['integration'] });
    if (!log) throw new NotFoundException('API log not found');
    return log;
  }

  // ========== Stats ==========
  async getStats(clinicId: string): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    totalLogs: number;
    successRate: number;
    avgDurationMs: number;
  }> {
    const integrations = await this.integrationRepo.find({ where: { clinicId } });
    const logs = await this.logRepo.find({ where: { clinicId }, take: 1000 });

    const totalIntegrations = integrations.length;
    const activeIntegrations = integrations.filter(i => i.status === IntegrationStatus.ACTIVE).length;
    const totalLogs = logs.length;
    const successfulLogs = logs.filter(l => l.status === ApiLogStatus.SUCCESS).length;
    const successRate = totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0;
    const avgDurationMs = logs.length > 0
      ? logs.reduce((sum, l) => sum + (l.durationMs || 0), 0) / logs.length
      : 0;

    return { totalIntegrations, activeIntegrations, totalLogs, successRate, avgDurationMs };
  }
}