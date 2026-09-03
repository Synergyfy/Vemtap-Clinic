import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { PurchaseOrder, PurchaseOrderStatus } from '../entities/purchase-order.entity';
import { CreateSupplierDto, UpdateSupplierDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, SupplierQueryDto } from './dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private orderRepository: Repository<PurchaseOrder>,
  ) {}

  async createSupplier(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAllSuppliers(query: SupplierQueryDto): Promise<Supplier[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    return this.supplierRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOneSupplier(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOneSupplier(id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async removeSupplier(id: string): Promise<void> {
    const supplier = await this.findOneSupplier(id);
    await this.supplierRepository.remove(supplier);
  }

  async createOrder(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = this.orderRepository.create(dto);
    return this.orderRepository.save(order);
  }

  async findAllOrders(clinicId?: string): Promise<PurchaseOrder[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.orderRepository.find({ where, relations: ['supplier'], order: { createdAt: 'DESC' } });
  }

  async updateOrder(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Purchase order not found');
    Object.assign(order, dto);
    return this.orderRepository.save(order);
  }

  async deliverOrder(id: string): Promise<PurchaseOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Purchase order not found');

    if (order.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Order already received');
    }

    order.status = PurchaseOrderStatus.RECEIVED;
    order.actualDeliveryDate = new Date();
    return this.orderRepository.save(order);
  }
}
