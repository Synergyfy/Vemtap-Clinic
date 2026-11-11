import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicSetting } from '../entities/clinic-setting.entity';
import { UserSetting } from '../entities/user-setting.entity';
import { AppSetting } from '../entities/app-setting.entity';
import { SetSettingDto, SettingQueryDto } from './dto';

const toMap = <T extends { key: string; value: string }>(rows: T[]): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ClinicSetting)
    private readonly repo: Repository<ClinicSetting>,
    @InjectRepository(UserSetting)
    private readonly userRepo: Repository<UserSetting>,
    @InjectRepository(AppSetting)
    private readonly appRepo: Repository<AppSetting>,
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
    return toMap(await this.repo.find({ where: { clinicId, category } }));
  }

  async getAll(clinicId: string): Promise<Record<string, string>> {
    return toMap(await this.repo.find({ where: { clinicId } }));
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

  // ─── Per-user preferences ──────────────────────────────────────────────────

  async getMine(userId: string): Promise<Record<string, string>> {
    return toMap(await this.userRepo.find({ where: { userId }, order: { key: 'ASC' } }));
  }

  async setMine(userId: string, dto: SetSettingDto): Promise<UserSetting> {
    let setting = await this.userRepo.findOne({ where: { userId, key: dto.key } });
    if (setting) {
      setting.value = dto.value;
    } else {
      setting = this.userRepo.create({ userId, key: dto.key, value: dto.value });
    }
    return this.userRepo.save(setting);
  }

  async bulkSetMine(userId: string, dtos: SetSettingDto[]): Promise<UserSetting[]> {
    const results: UserSetting[] = [];
    for (const dto of dtos) {
      results.push(await this.setMine(userId, dto));
    }
    return results;
  }

  async removeMine(userId: string, key: string): Promise<void> {
    await this.userRepo.delete({ userId, key });
  }

  // ─── Platform-wide settings (super admin console) ──────────────────────────

  async getApp(): Promise<Record<string, string>> {
    return toMap(await this.appRepo.find({ order: { key: 'ASC' } }));
  }

  async setApp(dto: SetSettingDto): Promise<AppSetting> {
    let setting = await this.appRepo.findOne({ where: { key: dto.key } });
    if (setting) {
      setting.value = dto.value;
    } else {
      setting = this.appRepo.create({ key: dto.key, value: dto.value });
    }
    return this.appRepo.save(setting);
  }

  async bulkSetApp(dtos: SetSettingDto[]): Promise<AppSetting[]> {
    const results: AppSetting[] = [];
    for (const dto of dtos) {
      results.push(await this.setApp(dto));
    }
    return results;
  }

  async removeApp(key: string): Promise<void> {
    await this.appRepo.delete({ key });
  }
}
