import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyConfig, CurrencyCode } from '../entities/currency-config.entity';
import { CreateCurrencyConfigDto, UpdateCurrencyConfigDto, CurrencyConfigQueryDto } from './dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyConfig) private currencyRepo: Repository<CurrencyConfig>,
  ) {}

  async create(dto: CreateCurrencyConfigDto): Promise<CurrencyConfig> {
    const existing = await this.currencyRepo.findOne({ where: { code: dto.code, clinicId: dto.clinicId } });
    if (existing) throw new BadRequestException('Currency already configured for this clinic');

    // If this is base currency, unset other base currencies for this clinic
    if (dto.isBase) {
      await this.currencyRepo.update({ clinicId: dto.clinicId, isBase: true }, { isBase: false });
    }

    const currency = this.currencyRepo.create(dto);
    return this.currencyRepo.save(currency);
  }

  async findAll(query: CurrencyConfigQueryDto): Promise<CurrencyConfig[]> {
    const where: any = {};
    if (query.code) where.code = query.code;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.isBase !== undefined) where.isBase = query.isBase;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.currencyRepo.find({ where, order: { code: 'ASC' } });
  }

  async findById(id: string): Promise<CurrencyConfig> {
    const currency = await this.currencyRepo.findOne({ where: { id } });
    if (!currency) throw new NotFoundException('Currency config not found');
    return currency;
  }

  async findBaseCurrency(clinicId: string): Promise<CurrencyConfig | null> {
    return this.currencyRepo.findOne({ where: { clinicId, isBase: true, isActive: true } });
  }

  async update(id: string, dto: UpdateCurrencyConfigDto): Promise<CurrencyConfig> {
    const currency = await this.findById(id);

    // If setting as base, unset other base currencies
    if (dto.isBase === true) {
      await this.currencyRepo.update({ clinicId: currency.clinicId, isBase: true }, { isBase: false });
    }

    Object.assign(currency, dto);
    return this.currencyRepo.save(currency);
  }

  async remove(id: string): Promise<void> {
    const currency = await this.findById(id);
    if (currency.isBase) throw new BadRequestException('Cannot delete base currency');
    await this.currencyRepo.remove(currency);
  }

  async convert(amount: number, fromCode: CurrencyCode, toCode: CurrencyCode, clinicId: string): Promise<number> {
    if (fromCode === toCode) return amount;

    const [fromCurrency, toCurrency] = await Promise.all([
      this.currencyRepo.findOne({ where: { code: fromCode, clinicId, isActive: true } }),
      this.currencyRepo.findOne({ where: { code: toCode, clinicId, isActive: true } }),
    ]);

    if (!fromCurrency || !toCurrency) {
      throw new BadRequestException('Currency not found or inactive');
    }

    // Convert to base first, then to target
    const baseAmount = amount / fromCurrency.exchangeRateToBase;
    return baseAmount * toCurrency.exchangeRateToBase;
  }

  async getStats(clinicId: string) {
    const currencies = await this.currencyRepo.find({ where: { clinicId } });
    return {
      total: currencies.length,
      active: currencies.filter(c => c.isActive).length,
      base: currencies.find(c => c.isBase)?.code || null,
    };
  }
}