import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { Drug } from '../entities/drug.entity';
import { DispensingRecord } from '../entities/dispensing-record.entity';
import { CreateDrugDto, UpdateDrugDto, DispenseDrugDto, DrugQueryDto } from './dto';

@Injectable()
export class DrugsService {
  constructor(
    @InjectRepository(Drug)
    private drugRepository: Repository<Drug>,
    @InjectRepository(DispensingRecord)
    private dispensingRepository: Repository<DispensingRecord>,
  ) {}

  async create(dto: CreateDrugDto): Promise<Drug> {
    const drug = this.drugRepository.create(dto);
    return this.drugRepository.save(drug);
  }

  async findAll(query: DrugQueryDto): Promise<Drug[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.category) where.category = query.category;
    if (query.search) where.name = Like(`%${query.search}%`);
    if (query.lowStock) {
      where.quantityInStock = LessThan(10); // Will need proper import
    }
    return this.drugRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Drug> {
    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) throw new NotFoundException('Drug not found');
    return drug;
  }

  async update(id: string, dto: UpdateDrugDto): Promise<Drug> {
    const drug = await this.findOne(id);
    Object.assign(drug, dto);
    return this.drugRepository.save(drug);
  }

  async remove(id: string): Promise<void> {
    const drug = await this.findOne(id);
    await this.drugRepository.remove(drug);
  }

  async dispense(dto: DispenseDrugDto): Promise<DispensingRecord> {
    const drug = await this.findOne(dto.drugId);
    if (drug.quantityInStock < dto.quantityDispensed) {
      throw new BadRequestException('Insufficient stock');
    }
    drug.quantityInStock -= dto.quantityDispensed;
    await this.drugRepository.save(drug);

    const record = this.dispensingRepository.create({
      ...dto,
      unitPrice: drug.unitPrice,
      totalPrice: drug.unitPrice * dto.quantityDispensed,
    });
    return this.dispensingRepository.save(record);
  }

  async getLowStock(clinicId: string): Promise<Drug[]> {
    return this.drugRepository
      .createQueryBuilder('drug')
      .where('drug.clinicId = :clinicId', { clinicId })
      .andWhere('drug.quantityInStock <= drug.reorderLevel')
      .getMany();
  }

  async deductStock(id: string, quantity: number): Promise<Drug> {
    const drug = await this.findOne(id);
    if (drug.quantityInStock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }
    drug.quantityInStock -= quantity;
    return this.drugRepository.save(drug);
  }

  async restock(id: string, quantity: number): Promise<Drug> {
    const drug = await this.findOne(id);
    drug.quantityInStock += quantity;
    return this.drugRepository.save(drug);
  }
}


