import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicSetting } from '../entities/clinic-setting.entity';
import { SetSettingDto, SettingQueryDto } from './dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ClinicSetting)
    private readonly repo: Repository<ClinicSetting>,
  ) {}

  async findAll(query: SettingQueryDto): Promise<ClinicSetting[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.category) where.category = query.category;
    return this.repo.find({ where, order: { category: 'ASC', key: 'ASC' } });
  }

  async get(clinicId: string, key: string): Promise<ClinicSetting | null> {
    return this.repo.findOne({ where: { clinicId, key } });
  }

  async getByCategory(clinicId: string, category: string): Promise<Record<string, string>> {
    const settings = await this.repo.find({ where: { clinicId, category } });
    const result: Record<string, string> = {};
    for (const s of settings) result[s.key] = s.value;
    return result;
  }

  async getAll(clinicId: string): Promise<Record<string, string>> {
    const settings = await this.repo.find({ where: { clinicId } });
    const result: Record<string, string> = {};
    for (const s of settings) result[s.key] = s.value;
    return result;
  }

  async set(clinicId: string, dto: SetSettingDto): Promise<ClinicSetting> {
    let setting = await this.repo.findOne({ where: { clinicId, key: dto.key } });
    if (setting) {
      setting.value = dto.value;
      if (dto.category) setting.category = dto.category;
    } else {
      setting = this.repo.create({
        clinicId,
        key: dto.key,
        value: dto.value,
        category: dto.category || 'general',
      });
    }
    return this.repo.save(setting);
  }

  async bulkSet(clinicId: string, dtos: SetSettingDto[]): Promise<ClinicSetting[]> {
    const results: ClinicSetting[] = [];
    for (const dto of dtos) {
      results.push(await this.set(clinicId, dto));
    }
    return results;
  }

  async remove(clinicId: string, key: string): Promise<void> {
    await this.repo.delete({ clinicId, key });
  }
}
