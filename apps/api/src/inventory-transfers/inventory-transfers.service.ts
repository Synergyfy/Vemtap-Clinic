import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferRequest, TransferType, TransferStatus } from '../entities/transfer-request.entity';
import { TransferItem, ItemType } from '../entities/transfer-item.entity';
import { Branch } from '../entities/branch.entity';
import { Product } from '../entities/product.entity';
import { Drug } from '../entities/drug.entity';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import {
  CreateTransferRequestDto, UpdateTransferRequestDto, TransferRequestQueryDto,
  ApproveTransferDto, ShipTransferDto, ReceiveTransferDto, CancelTransferDto,
  TransferItemDto, ShipItemDto, ReceiveItemDto,
} from './dto';

@Injectable()
export class InventoryTransfersService {
  constructor(
    @InjectRepository(TransferRequest) private transferRepo: Repository<TransferRequest>,
    @InjectRepository(TransferItem) private itemRepo: Repository<TransferItem>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Drug) private drugRepo: Repository<Drug>,
    @InjectRepository(OpticalInventoryItem) private opticalRepo: Repository<OpticalInventoryItem>,
  ) {}

  // ========== Transfer Requests ==========
  async createTransferRequest(dto: CreateTransferRequestDto, clinicId: string, requestedById: string): Promise<TransferRequest> {
    const [fromBranch, toBranch] = await Promise.all([
      this.branchRepo.findOne({ where: { id: dto.fromBranchId, clinicId } }),
      this.branchRepo.findOne({ where: { id: dto.toBranchId, clinicId } }),
    ]);
    if (!fromBranch) throw new BadRequestException('Source branch not found');
    if (!toBranch) throw new BadRequestException('Destination branch not found');
    if (dto.fromBranchId === dto.toBranchId) throw new BadRequestException('Source and destination branches cannot be the same');

    for (const item of dto.items) {
      const available = await this.getAvailableStock(item, dto.fromBranchId, clinicId);
      if (available < item.quantityRequested) {
        throw new BadRequestException(`Insufficient stock for item ${item.itemType} at source branch`);
      }
    }

    const count = await this.transferRepo.count({ where: { clinicId } });
    const transfer = this.transferRepo.create({
      ...dto,
      transferNumber: `TRF-${String(count + 1).padStart(4, '0')}`,
      clinicId,
      requestedById,
      requestedAt: new Date(),
      status: TransferStatus.REQUESTED,
    });
    const saved = await this.transferRepo.save(transfer);

    const items = dto.items.map(itemDto => this.itemRepo.create({
      ...itemDto,
      transferRequestId: saved.id,
      clinicId,
      quantityShipped: 0,
      quantityReceived: 0,
    }));
    await this.itemRepo.save(items);

    return this.findTransferById(saved.id);
  }

  async findTransfers(query: TransferRequestQueryDto): Promise<TransferRequest[]> {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.fromBranchId) where.fromBranchId = query.fromBranchId;
    if (query.toBranchId) where.toBranchId = query.toBranchId;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.transferRepo.find({ where, relations: ['fromBranch', 'toBranch', 'items', 'requestedBy'], order: { createdAt: 'DESC' } });
  }

  async findTransferById(id: string): Promise<TransferRequest> {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['fromBranch', 'toBranch', 'items', 'requestedBy', 'approvedBy', 'shippedBy', 'receivedBy'],
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    return transfer;
  }

  async updateTransfer(id: string, dto: UpdateTransferRequestDto): Promise<TransferRequest> {
    const transfer = await this.findTransferById(id);
    if (transfer.status !== TransferStatus.DRAFT && transfer.status !== TransferStatus.REQUESTED) {
      throw new BadRequestException('Can only update transfers in DRAFT or REQUESTED status');
    }
    Object.assign(transfer, dto);
    return this.transferRepo.save(transfer);
  }

  async approveTransfer(id: string, dto: ApproveTransferDto, approverId: string): Promise<TransferRequest> {
    const transfer = await this.findTransferById(id);
    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new BadRequestException('Can only approve transfers in REQUESTED status');
    }

    transfer.status = TransferStatus.APPROVED;
    transfer.approvedById = approverId;
    transfer.approvedAt = new Date();
    transfer.approvalNotes = dto.notes ?? '';
    return this.transferRepo.save(transfer);
  }

  async shipTransfer(id: string, dto: ShipTransferDto, shipperId: string): Promise<TransferRequest> {
    const transfer = await this.findTransferById(id);
    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestException('Can only ship transfers with APPROVED status');
    }

    for (const shipItem of dto.items) {
      const item = await this.itemRepo.findOne({ where: { id: shipItem.itemId, transferRequestId: id } });
      if (!item) throw new BadRequestException(`Item ${shipItem.itemId} not found in this transfer`);
      if (shipItem.quantityShipped > item.quantityRequested - item.quantityShipped) {
        throw new BadRequestException(`Cannot ship more than requested for item ${item.id}`);
      }
      item.quantityShipped += shipItem.quantityShipped;
      await this.itemRepo.save(item);
    }

    const allItems = await this.itemRepo.find({ where: { transferRequestId: id } });
    const allFullyShipped = allItems.every(i => i.quantityShipped >= i.quantityRequested);

    transfer.status = TransferStatus.IN_TRANSIT;
    transfer.shippedById = shipperId;
    transfer.shippedAt = new Date();
    transfer.shippingNotes = dto.notes ?? '';
    return this.transferRepo.save(transfer);
  }

  async receiveTransfer(id: string, dto: ReceiveTransferDto, receiverId: string): Promise<TransferRequest> {
    const transfer = await this.findTransferById(id);
    if (transfer.status !== TransferStatus.IN_TRANSIT) {
      throw new BadRequestException('Can only receive transfers with IN_TRANSIT status');
    }

    for (const receiveItem of dto.items) {
      const item = await this.itemRepo.findOne({ where: { id: receiveItem.itemId, transferRequestId: id } });
      if (!item) throw new BadRequestException(`Item ${receiveItem.itemId} not found in this transfer`);
      if (receiveItem.quantityReceived > item.quantityShipped - item.quantityReceived) {
        throw new BadRequestException(`Cannot receive more than shipped for item ${item.id}`);
      }
      item.quantityReceived += receiveItem.quantityReceived;
      await this.itemRepo.save(item);

      await this.moveStockToDestination(item, receiveItem.quantityReceived);
    }

    const allItems = await this.itemRepo.find({ where: { transferRequestId: id } });
    const allFullyReceived = allItems.every(i => i.quantityReceived >= i.quantityRequested);

    if (allFullyReceived) {
      transfer.status = TransferStatus.COMPLETED;
    } else {
      transfer.status = TransferStatus.RECEIVED;
    }

    transfer.receivedById = receiverId;
    transfer.receivedAt = new Date();
    transfer.receivingNotes = dto.notes ?? '';
    return this.transferRepo.save(transfer);
  }

  async cancelTransfer(id: string, dto: CancelTransferDto, cancellerId: string): Promise<TransferRequest> {
    const transfer = await this.findTransferById(id);
    if (transfer.status === TransferStatus.COMPLETED || transfer.status === TransferStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel completed or already cancelled transfers');
    }

    transfer.status = TransferStatus.CANCELLED;
    transfer.cancelledById = cancellerId;
    transfer.cancelledAt = new Date();
    transfer.cancellationReason = dto.reason;
    return this.transferRepo.save(transfer);
  }

  async deleteTransfer(id: string): Promise<void> {
    const transfer = await this.findTransferById(id);
    if (transfer.status !== TransferStatus.DRAFT && transfer.status !== TransferStatus.CANCELLED && transfer.status !== TransferStatus.REJECTED) {
      throw new BadRequestException('Can only delete transfers in DRAFT, CANCELLED, or REJECTED status');
    }
    await this.itemRepo.delete({ transferRequestId: id });
    await this.transferRepo.remove(transfer);
  }

  // ========== Stock Movement ==========
  private async moveStockToDestination(item: TransferItem, quantity: number): Promise<void> {
    const transfer = await this.transferRepo.findOne({ where: { id: item.transferRequestId } });
    if (!transfer) return;
    const destBranchId = transfer.toBranchId;
    const clinicId = transfer.clinicId;

    if (item.itemType === ItemType.PRODUCT && item.productId) {
      const [sourceProduct, destProduct] = await Promise.all([
        this.productRepo.findOne({ where: { id: item.productId, clinicId: item.clinicId } }),
        this.productRepo.findOne({ where: { id: item.productId, clinicId } }),
      ]);
      if (sourceProduct) {
        sourceProduct.quantityInStock -= quantity;
        await this.productRepo.save(sourceProduct);
      }
      if (destProduct) {
        destProduct.quantityInStock += quantity;
        await this.productRepo.save(destProduct);
      }
    } else if (item.itemType === ItemType.DRUG && item.drugId) {
      const [sourceDrug, destDrug] = await Promise.all([
        this.drugRepo.findOne({ where: { id: item.drugId, clinicId: item.clinicId } }),
        this.drugRepo.findOne({ where: { id: item.drugId, clinicId } }),
      ]);
      if (sourceDrug) {
        sourceDrug.quantityInStock -= quantity;
        await this.drugRepo.save(sourceDrug);
      }
      if (destDrug) {
        destDrug.quantityInStock += quantity;
        await this.drugRepo.save(destDrug);
      }
    } else if (item.itemType === ItemType.OPTICAL && item.opticalItemId) {
      const [sourceOptical, destOptical] = await Promise.all([
        this.opticalRepo.findOne({ where: { id: item.opticalItemId, clinicId: item.clinicId } }),
        this.opticalRepo.findOne({ where: { id: item.opticalItemId, clinicId } }),
      ]);
      if (sourceOptical) {
        sourceOptical.quantityInStock -= quantity;
        await this.opticalRepo.save(sourceOptical);
      }
      if (destOptical) {
        destOptical.quantityInStock += quantity;
        await this.opticalRepo.save(destOptical);
      }
    }
  }

  private async getAvailableStock(item: TransferItemDto, branchId: string, clinicId: string): Promise<number> {
    if (item.itemType === 'product' && item.productId) {
      const product = await this.productRepo.findOne({ where: { id: item.productId, clinicId } });
      return product?.quantityInStock || 0;
    } else if (item.itemType === 'drug' && item.drugId) {
      const drug = await this.drugRepo.findOne({ where: { id: item.drugId, clinicId } });
      return drug?.quantityInStock || 0;
    } else if (item.itemType === 'optical' && item.opticalItemId) {
      const optical = await this.opticalRepo.findOne({ where: { id: item.opticalItemId, clinicId } });
      return optical?.quantityInStock || 0;
    }
    return 0;
  }

  async getStats(clinicId: string): Promise<{ totalTransfers: number; byStatus: Record<string, number>; byType: Record<string, number> }> {
    const transfers = await this.transferRepo.find({ where: { clinicId } });
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const t of transfers) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byType[t.type] = (byType[t.type] || 0) + 1;
    }
    return { totalTransfers: transfers.length, byStatus, byType };
  }
}