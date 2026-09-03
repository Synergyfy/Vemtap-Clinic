import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ReturnRequest, ReturnType, ReturnStatus, ReturnItem, ReturnReason } from '../entities/return-request.entity';
import { Refund, RefundStatus, RefundMethod } from '../entities/refund.entity';
import { Product } from '../entities/product.entity';
import { Drug } from '../entities/drug.entity';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import {
  CreateReturnRequestDto, UpdateReturnRequestDto, ReviewReturnDto, ReceiveReturnDto, ReturnRequestQueryDto,
  CreateRefundDto, ProcessRefundDto, RefundQueryDto, ReturnItemDto,
} from './dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest) private returnRepo: Repository<ReturnRequest>,
    @InjectRepository(Refund) private refundRepo: Repository<Refund>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Drug) private drugRepo: Repository<Drug>,
    @InjectRepository(OpticalInventoryItem) private opticalRepo: Repository<OpticalInventoryItem>,
  ) {}

  // ========== Return Requests ==========
  async createReturnRequest(dto: CreateReturnRequestDto, clinicId: string): Promise<ReturnRequest> {
    // Validate items exist and calculate totals
    for (const item of dto.items) {
      const validated = await this.validateItem(item, clinicId);
      if (!validated) {
        throw new BadRequestException(`Item ${item.itemName} not found or insufficient stock`);
      }
    }

    const count = await this.returnRepo.count({ where: { clinicId } });
    const returnRequest = this.returnRepo.create({
      ...dto,
      returnNumber: `RET-${String(count + 1).padStart(4, '0')}`,
      clinicId,
      status: ReturnStatus.REQUESTED,
    });
    return this.returnRepo.save(returnRequest);
  }

  async findReturnRequests(query: ReturnRequestQueryDto): Promise<ReturnRequest[]> {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    if (query.invoiceId) where.invoiceId = query.invoiceId;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.returnRepo.find({ where, relations: ['patient', 'invoice', 'refunds'], order: { createdAt: 'DESC' } });
  }

  async findReturnById(id: string): Promise<ReturnRequest> {
    const returnReq = await this.returnRepo.findOne({ where: { id }, relations: ['patient', 'invoice', 'refunds', 'reviewedBy', 'approvedBy', 'receivedBy'] });
    if (!returnReq) throw new NotFoundException('Return request not found');
    return returnReq;
  }

  async updateReturnRequest(id: string, dto: UpdateReturnRequestDto): Promise<ReturnRequest> {
    const returnReq = await this.findReturnById(id);
    if (returnReq.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException('Can only update returns in REQUESTED status');
    }
    Object.assign(returnReq, dto);
    return this.returnRepo.save(returnReq);
  }

  async reviewReturn(id: string, dto: ReviewReturnDto, reviewerId: string): Promise<ReturnRequest> {
    const returnReq = await this.findReturnById(id);
    if (returnReq.status !== ReturnStatus.REQUESTED && returnReq.status !== ReturnStatus.UNDER_REVIEW) {
      throw new BadRequestException('Can only review returns in REQUESTED or UNDER_REVIEW status');
    }

    returnReq.status = dto.status;
    returnReq.reviewedById = reviewerId;
    returnReq.reviewedAt = new Date();
    returnReq.reviewNotes = dto.notes ?? '';

    if (dto.status === ReturnStatus.APPROVED) {
      returnReq.approvedById = reviewerId;
      returnReq.approvedAt = new Date();
    }

    return this.returnRepo.save(returnReq);
  }

  async receiveReturn(id: string, dto: ReceiveReturnDto, receiverId: string): Promise<ReturnRequest> {
    const returnReq = await this.findReturnById(id);
    if (returnReq.status !== ReturnStatus.APPROVED) {
      throw new BadRequestException('Can only receive returns with APPROVED status');
    }

    returnReq.status = ReturnStatus.RECEIVED;
    returnReq.receivedById = receiverId;
    returnReq.receivedAt = new Date();
    returnReq.receivedNotes = dto.notes ?? '';

    // Restore inventory
    await this.restoreInventory(returnReq);

    return this.returnRepo.save(returnReq);
  }

  async completeReturn(id: string): Promise<ReturnRequest> {
    const returnReq = await this.findReturnById(id);
    if (returnReq.status !== ReturnStatus.RECEIVED) {
      throw new BadRequestException('Can only complete returns with RECEIVED status');
    }

    returnReq.status = ReturnStatus.COMPLETED;
    return this.returnRepo.save(returnReq);
  }

  async deleteReturnRequest(id: string): Promise<void> {
    const returnReq = await this.findReturnById(id);
    if (returnReq.status !== ReturnStatus.REQUESTED && returnReq.status !== ReturnStatus.REJECTED) {
      throw new BadRequestException('Can only delete returns in REQUESTED or REJECTED status');
    }
    await this.returnRepo.remove(returnReq);
  }

  // ========== Refunds ==========
  async createRefund(dto: CreateRefundDto, clinicId: string): Promise<Refund> {
    const returnReq = await this.returnRepo.findOne({ where: { id: dto.returnRequestId, clinicId } });
    if (!returnReq) throw new NotFoundException('Return request not found');

    if (returnReq.status !== ReturnStatus.APPROVED && returnReq.status !== ReturnStatus.RECEIVED && returnReq.status !== ReturnStatus.COMPLETED) {
      throw new BadRequestException('Return must be approved or received before refund');
    }

    // Check if refund already exists
    const existing = await this.refundRepo.findOne({ where: { returnRequestId: dto.returnRequestId } });
    if (existing) throw new BadRequestException('Refund already exists for this return');

    const count = await this.refundRepo.count({ where: { clinicId } });
    const refund = this.refundRepo.create({
      ...dto,
      refundNumber: `REF-${String(count + 1).padStart(4, '0')}`,
      clinicId,
      status: RefundStatus.PENDING,
    });
    return this.refundRepo.save(refund);
  }

  async findRefunds(query: RefundQueryDto): Promise<Refund[]> {
    const where: any = {};
    if (query.returnRequestId) where.returnRequestId = query.returnRequestId;
    if (query.status) where.status = query.status;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.refundRepo.find({ where, relations: ['returnRequest', 'processedBy'], order: { createdAt: 'DESC' } });
  }

  async findRefundById(id: string): Promise<Refund> {
    const refund = await this.refundRepo.findOne({ where: { id }, relations: ['returnRequest', 'processedBy', 'clinic'] });
    if (!refund) throw new NotFoundException('Refund not found');
    return refund;
  }

  async processRefund(id: string, dto: ProcessRefundDto, processorId: string): Promise<Refund> {
    const refund = await this.findRefundById(id);
    refund.status = dto.status;
    refund.processedById = processorId;
    refund.processedAt = new Date();
    if (dto.transactionReference) refund.transactionReference = dto.transactionReference;
    if (dto.notes) refund.notes = dto.notes;
    if (dto.failureReason) refund.failureReason = dto.failureReason;
    return this.refundRepo.save(refund);
  }

  async deleteRefund(id: string): Promise<void> {
    const refund = await this.findRefundById(id);
    if (refund.status !== RefundStatus.PENDING && refund.status !== RefundStatus.CANCELLED) {
      throw new BadRequestException('Can only delete refunds in PENDING or CANCELLED status');
    }
    await this.refundRepo.remove(refund);
  }

  // ========== Inventory Restoration ==========
  private async restoreInventory(returnReq: ReturnRequest): Promise<void> {
    for (const item of returnReq.items) {
      if (item.itemType === 'product') {
        const product = await this.productRepo.findOne({ where: { id: item.itemId, clinicId: returnReq.clinicId } });
        if (product) {
          product.quantityInStock += item.quantity;
          await this.productRepo.save(product);
        }
      } else if (item.itemType === 'drug') {
        const drug = await this.drugRepo.findOne({ where: { id: item.itemId, clinicId: returnReq.clinicId } });
        if (drug) {
          drug.quantityInStock += item.quantity;
          await this.drugRepo.save(drug);
        }
      } else if (item.itemType === 'optical') {
        const optical = await this.opticalRepo.findOne({ where: { id: item.itemId, clinicId: returnReq.clinicId } });
        if (optical) {
          optical.quantityInStock += item.quantity;
          await this.opticalRepo.save(optical);
        }
      }
    }
  }

  private async validateItem(item: ReturnItemDto, clinicId: string): Promise<boolean> {
    if (item.itemType === 'product') {
      return !!await this.productRepo.findOne({ where: { id: item.itemId, clinicId } });
    } else if (item.itemType === 'drug') {
      return !!await this.drugRepo.findOne({ where: { id: item.itemId, clinicId } });
    } else if (item.itemType === 'optical') {
      return !!await this.opticalRepo.findOne({ where: { id: item.itemId, clinicId } });
    }
    return false;
  }

  // ========== Stats ==========
  async getStats(clinicId: string): Promise<{ totalReturns: number; byStatus: Record<string, number>; totalRefunds: number; refundedAmount: number }> {
    const returns = await this.returnRepo.find({ where: { clinicId } });
    const refunds = await this.refundRepo.find({ where: { clinicId } });

    const byStatus: Record<string, number> = {};
    for (const r of returns) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }

    const refundedAmount = refunds
      .filter(r => r.status === RefundStatus.COMPLETED)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      totalReturns: returns.length,
      byStatus,
      totalRefunds: refunds.length,
      refundedAmount,
    };
  }
}