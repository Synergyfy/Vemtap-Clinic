import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, CreatePaymentDto, InvoiceQueryDto } from './dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...dto,
      balance: dto.totalAmount,
    });
    return this.invoiceRepository.save(invoice);
  }

  async findAllInvoices(query: InvoiceQueryDto): Promise<Invoice[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;
    if (query.startDate && query.endDate) {
      where.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }
    return this.invoiceRepository.find({ where, relations: ['patient', 'staff', 'payments'], order: { createdAt: 'DESC' } });
  }

  async findOneInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id }, relations: ['patient', 'staff', 'branch', 'payments'] });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);
    Object.assign(invoice, dto);
    return this.invoiceRepository.save(invoice);
  }

  async makePayment(dto: CreatePaymentDto): Promise<Payment> {
    const invoice = await this.findOneInvoice(dto.invoiceId);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }
    const payment = this.paymentRepository.create(dto);
    const savedPayment = await this.paymentRepository.save(payment);

    invoice.amountPaid += dto.amount;
    invoice.balance = invoice.totalAmount - invoice.amountPaid;
    invoice.status = invoice.balance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
    await this.invoiceRepository.save(invoice);

    return savedPayment;
  }

  async getPayments(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepository.find({ where: { invoiceId }, relations: ['receivedBy'], order: { createdAt: 'DESC' } });
  }

  async getRevenue(clinicId: string) {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amountPaid)', 'totalCollected')
      .addSelect('SUM(invoice.balance)', 'totalOutstanding')
      .where('invoice.clinicId = :clinicId', { clinicId })
      .getRawOne();
    return {
      totalCollected: parseFloat(result?.totalCollected || '0'),
      totalOutstanding: parseFloat(result?.totalOutstanding || '0'),
    };
  }
}
