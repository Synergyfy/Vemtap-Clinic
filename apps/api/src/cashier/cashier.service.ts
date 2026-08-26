import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashierShift, ShiftStatus } from '../entities/cashier-shift.entity';
import { Payment } from '../entities/payment.entity';
import { CashierTransaction, CashierTransactionStatus, CashierPaymentMethod } from '../entities/cashier-transaction.entity';
import { Product } from '../entities/product.entity';
import { OpenShiftDto, CloseShiftDto, ShiftQueryDto, CompleteTransactionDto, CreateProductDto, CashierCartItemDto } from './dto';

@Injectable()
export class CashierService {
  constructor(
    @InjectRepository(CashierShift) private shiftRepo: Repository<CashierShift>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(CashierTransaction) private transactionRepo: Repository<CashierTransaction>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async openShift(dto: OpenShiftDto): Promise<CashierShift> {
    const existingOpen = await this.shiftRepo.findOne({
      where: { staffId: dto.staffId, status: ShiftStatus.OPEN },
    });
    if (existingOpen) throw new BadRequestException('Staff already has an open shift');

    const shiftCount = await this.shiftRepo.count({ where: { clinicId: dto.clinicId } });
    const shift = this.shiftRepo.create({
      ...dto,
      shiftNumber: `SHIFT-${String(shiftCount + 1).padStart(4, '0')}`,
      status: ShiftStatus.OPEN,
      openedAt: new Date(),
    });
    return this.shiftRepo.save(shift);
  }

  async closeShift(id: string, dto: CloseShiftDto): Promise<CashierShift> {
    const shift = await this.shiftRepo.findOne({ where: { id }, relations: ['staff'] });
    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.status === ShiftStatus.CLOSED) throw new BadRequestException('Shift already closed');

    const payments = await this.paymentRepo.find({ where: { clinicId: shift.clinicId } });

    let totalCash = 0;
    let totalCard = 0;
    let totalTransfer = 0;
    for (const p of payments) {
      if (p.createdAt >= shift.openedAt) {
        if (p.paymentMethod === 'cash') totalCash += Number(p.amount);
        else if (p.paymentMethod === 'card') totalCard += Number(p.amount);
        else if (p.paymentMethod === 'transfer') totalTransfer += Number(p.amount);
      }
    }

    const expectedBalance = Number(shift.openingBalance) + totalCash + totalCard + totalTransfer;

    shift.closingBalance = dto.closingBalance;
    shift.expectedBalance = expectedBalance;
    shift.variance = dto.closingBalance - expectedBalance;
    shift.totalCashReceived = totalCash;
    shift.totalCardReceived = totalCard;
    shift.totalTransferReceived = totalTransfer;
    shift.status = ShiftStatus.CLOSED;
    shift.closedAt = new Date();
    if (dto.notes) shift.notes = dto.notes;

    return this.shiftRepo.save(shift);
  }

  async findAll(query: ShiftQueryDto): Promise<CashierShift[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.staffId) where.staffId = query.staffId;
    if (query.status) where.status = query.status;
    return this.shiftRepo.find({ where, relations: ['staff'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CashierShift> {
    const shift = await this.shiftRepo.findOne({ where: { id }, relations: ['staff', 'clinic'] });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async getOpenShift(staffId: string): Promise<CashierShift | null> {
    return this.shiftRepo.findOne({ where: { staffId, status: ShiftStatus.OPEN } });
  }

  async getDailySummary(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shifts = await this.shiftRepo.find({
      where: { clinicId, createdAt: { $gte: today } as any },
    });

    return {
      totalShifts: shifts.length,
      openShifts: shifts.filter(s => s.status === ShiftStatus.OPEN).length,
      closedShifts: shifts.filter(s => s.status === ShiftStatus.CLOSED).length,
    };
  }

  // ========== Transaction Methods ==========
  async completeTransaction(dto: CompleteTransactionDto, cashierName: string): Promise<CashierTransaction> {
    const subtotal = dto.items.reduce((sum, i) => sum + i.total, 0);
    const total = Math.max(0, subtotal - (dto.discount || 0));
    const paid = dto.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, total - paid);

    const count = await this.transactionRepo.count({ where: { clinicId: dto.clinicId } });
    const receiptNumber = `RCP-${String(count + 1).padStart(4, '0')}`;

    const transaction = this.transactionRepo.create({
      receiptNumber,
      items: dto.items,
      payments: dto.payments,
      subtotal,
      discount: dto.discount || 0,
      total,
      paid,
      balance,
      status: CashierTransactionStatus.COMPLETED,
      cashierName,
      patientName: dto.patientName,
      note: dto.note,
      clinicId: dto.clinicId,
    });
    return this.transactionRepo.save(transaction);
  }

  async findTransactions(clinicId?: string): Promise<CashierTransaction[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.transactionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findTransactionById(id: string): Promise<CashierTransaction> {
    const transaction = await this.transactionRepo.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async voidTransaction(id: string): Promise<CashierTransaction> {
    const transaction = await this.transactionRepo.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    transaction.status = CashierTransactionStatus.VOIDED;
    return this.transactionRepo.save(transaction);
  }

  // ========== Product Methods ==========
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...dto,
      quantityInStock: dto.stock || 0,
    });
    return this.productRepo.save(product);
  }

  async findProducts(clinicId?: string): Promise<Product[]> {
    const where: any = { isActive: true };
    if (clinicId) where.clinicId = clinicId;
    return this.productRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, updates);
    return this.productRepo.save(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.remove(product);
  }

  // ========== Stats ==========
  async getTransactionStats(clinicId: string) {
    const transactions = await this.transactionRepo.find({ where: { clinicId, status: CashierTransactionStatus.COMPLETED } });
    const total = transactions.reduce((sum, t) => sum + t.total, 0);
    const byMethod: Record<string, number> = {};
    for (const t of transactions) {
      for (const p of t.payments) {
        byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
      }
    }
    return { totalTransactions: transactions.length, totalRevenue: total, byMethod };
  }
}