import { Injectable } from '@nestjs/common';
import { CreateDemoRequestDto } from './dto';

export type DemoRequestRecord = {
  id: string;
  clinicType: string;
  clinicName: string;
  branchCount: string;
  preferredDate: string;
  preferredTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
};

@Injectable()
export class DemoRequestsService {
  private readonly demoRequests: DemoRequestRecord[] = [];

  create(dto: CreateDemoRequestDto): { success: boolean; message: string; data: DemoRequestRecord } {
    const request: DemoRequestRecord = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      clinicType: dto.clinicType,
      clinicName: dto.clinicName,
      branchCount: dto.branchCount,
      preferredDate: dto.preferredDate,
      preferredTime: dto.preferredTime,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      createdAt: new Date().toISOString(),
    };

    this.demoRequests.push(request);

    return {
      success: true,
      message: 'Demo request received successfully.',
      data: request,
    };
  }

  findAll() {
    return this.demoRequests;
  }
}
