import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { OpticalProductionItem, ProductionStage } from '../entities/optical-production-item.entity';
import { OpticalSale, SaleStatus, SalePaymentMethod } from '../entities/optical-sale.entity';
import { CreateOpticalItemDto, UpdateOpticalItemDto, CreateLensOrderDto, UpdateLensOrderDto } from './dto';

@Injectable()
export class OpticalService {
  constructor(
    @InjectRepository(OpticalInventoryItem)
    private itemRepository: Repository<OpticalInventoryItem>,
    @InjectRepository(LensOrder)
    private orderRepository: Repository<LensOrder>,
    @InjectRepository(OpticalProductionItem)
    private productionRepository: Repository<OpticalProductionItem>,
    @InjectRepository(OpticalSale)
    private saleRepository: Repository<OpticalSale>,
  ) {}

  async createItem(dto: CreateOpticalItemDto): Promise<OpticalInventoryItem> {
    const item = this.itemRepository.create(dto);
    return this.itemRepository.save(item);
  }

  async findAllItems(clinicId?: string): Promise<OpticalInventoryItem[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.itemRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOneItem(id: string): Promise<OpticalInventoryItem> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Optical item not found');
    return item;
  }

  async updateItem(id: string, dto: UpdateOpticalItemDto): Promise<OpticalInventoryItem> {
    const item = await this.findOneItem(id);
    Object.assign(item, dto);
    return this.itemRepository.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.findOneItem(id);
    await this.itemRepository.remove(item);
  }

  async createLensOrder(dto: CreateLensOrderDto): Promise<LensOrder> {
    const order = this.orderRepository.create(dto);
    return this.orderRepository.save(order);
  }

  async findAllLensOrders(clinicId?: string): Promise<LensOrder[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.orderRepository.find({ where, relations: ['patient'], order: { createdAt: 'DESC' } });
  }

  async updateLensOrder(id: string, dto: UpdateLensOrderDto): Promise<LensOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Lens order not found');
    Object.assign(order, dto);
    return this.orderRepository.save(order);
  }

  async updateProductionStage(id: string, stage: ProductionStage): Promise<OpticalProductionItem> {
    const production = await this.productionRepository.findOne({ where: { id } });
    if (!production) throw new NotFoundException('Production item not found');
    production.stage = stage;
    if (stage === ProductionStage.LENS_CUTTING && !production.startedAt) production.startedAt = new Date();
    if (stage === ProductionStage.COMPLETED) production.completedAt = new Date();
    return this.productionRepository.save(production);
  }

  async createProductionItem(data: { lensOrderId: string; inventoryItemId?: string; clinicId: string }): Promise<OpticalProductionItem> {
    const production = this.productionRepository.create(data);
    return this.productionRepository.save(production);
  }

  async getProductionByLensOrder(lensOrderId: string): Promise<OpticalProductionItem[]> {
    return this.productionRepository.find({ where: { lensOrderId }, order: { createdAt: 'ASC' } });
  }

  async createSale(data: {
    patientId?: string;
    inventoryItemId?: string;
    lensOrderId?: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: SalePaymentMethod;
    paymentReference?: string;
    cashierId?: string;
    clinicId: string;
  }): Promise<OpticalSale> {
    const count = await this.saleRepository.count({ where: { clinicId: data.clinicId } });
    const sale = this.saleRepository.create({
      ...data,
      saleNumber: `SALE-${String(count + 1).padStart(4, '0')}`,
      totalPrice: data.unitPrice * data.quantity,
      status: SaleStatus.COMPLETED,
    });
    return this.saleRepository.save(sale);
  }

  async findAllSales(clinicId?: string): Promise<OpticalSale[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.saleRepository.find({ where, relations: ['patient', 'inventoryItem'], order: { createdAt: 'DESC' } });
  }

  async findSalesByLensOrder(lensOrderId: string): Promise<OpticalSale[]> {
    return this.saleRepository.find({ where: { lensOrderId }, relations: ['patient', 'inventoryItem'] });
  }
}
