import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashierShift, ShiftStatus } from '../entities/cashier-shift.entity';
import { Payment } from '../entities/payment.entity';
import { OpenShiftDto, CloseShiftDto, ShiftQueryDto } from './dto';

@Injectable()
export class CashierService {
  constructor(
    @InjectRepository(CashierShift) private shiftRepo: Repository<CashierShift>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
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
}
