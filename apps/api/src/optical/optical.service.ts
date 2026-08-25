import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { CreateOpticalItemDto, UpdateOpticalItemDto, CreateLensOrderDto, UpdateLensOrderDto } from './dto';

@Injectable()
export class OpticalService {
  constructor(
    @InjectRepository(OpticalInventoryItem)
    private itemRepository: Repository<OpticalInventoryItem>,
    @InjectRepository(LensOrder)
    private orderRepository: Repository<LensOrder>,
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
}
