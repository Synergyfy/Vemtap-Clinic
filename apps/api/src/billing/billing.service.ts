import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, EntityManager } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { Patient } from '../entities/patient.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, CreatePaymentDto, InvoiceQueryDto } from './dto';
import { EmailService } from '../common/services/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private entityManager: EntityManager,
    private emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async notifyPatient(
    patientId: string,
    clinicId: string | null | undefined,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    try {
      await this.notificationsService.create({ title, message, type, patientId, clinicId: clinicId ?? undefined });
    } catch {
      // Notifications are best-effort; never fail billing actions.
    }
  }

  /** Alerts the cash desk and clinic admins about billing activity. */
  private async notifyStaff(
    clinicId: string | null | undefined,
    title: string,
    message: string,
    type: NotificationType = NotificationType.BILLING,
  ) {
    try {
      await this.notificationsService.notifyClinicRoles(
        clinicId,
        [UserRole.CASHIER, UserRole.CLINIC_ADMIN, UserRole.ADMIN],
        { title, message, type },
      );
    } catch {
      // Notifications are best-effort; never fail billing actions.
    }
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...dto,
      balance: dto.totalAmount,
    });
    const saved = await this.invoiceRepository.save(invoice);

    await this.notifyPatient(
      saved.patientId,
      saved.clinicId,
      'New invoice',
      `Invoice ${saved.invoiceNumber} for ₦${Number(saved.totalAmount).toLocaleString()} is now available.`,
      NotificationType.BILLING,
    );
    await this.notifyStaff(
      saved.clinicId,
      'New invoice',
      `Invoice ${saved.invoiceNumber} for ₦${Number(saved.totalAmount).toLocaleString()} was created.`,
    );

    return saved;
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

    const query = 'INSERT INTO payments (amount, "paymentMethod", reference, notes, "invoiceId", "clinicId") ' +
                  'VALUES ($1, $2, $3, $4, $5, $6) ' +
                  'RETURNING id';

    const result = await this.entityManager.query(
      query,
      [dto.amount, dto.paymentMethod, dto.reference, dto.notes, invoice.id, dto.clinicId]
    );

    const insertedId = result[0].id;
    const savedPayment = await this.entityManager.findOneOrFail(Payment, {
      where: { id: insertedId },
      relations: ['invoice'],
    });

    // Use a targeted UPDATE (not save) so TypeORM does not try to re-persist the
    // loaded `payments` relation and clobber payment.invoiceId with undefined.
    const amountPaid = Number(invoice.amountPaid) + Number(dto.amount);
    const balance = Number(invoice.totalAmount) - amountPaid;
    await this.invoiceRepository.update(invoice.id, {
      amountPaid,
      balance,
      status: balance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
    });

    await this.notifyPatient(
      invoice.patientId,
      invoice.clinicId,
      'Payment received',
      `We received a payment of ₦${Number(dto.amount).toLocaleString()} for invoice ${invoice.invoiceNumber}.`,
      NotificationType.BILLING,
    );
    await this.notifyStaff(
      invoice.clinicId,
      'Payment received',
      `Payment of ₦${Number(dto.amount).toLocaleString()} recorded for invoice ${invoice.invoiceNumber}.`,
    );

    // Send payment receipt email if patient has email
    const patient = await this.patientRepository.findOne({ where: { id: invoice.patientId } });
    if (patient?.email) {
      await this.emailService.sendTemplatedEmail('payment-receipt', patient.email, {
        amount: '₦' + dto.amount.toLocaleString(),
        method: dto.paymentMethod,
        reference: dto.reference || 'PAY-' + savedPayment.id.slice(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString(),
        patientName: patient.firstName + ' ' + patient.lastName,
      });
    }

    return savedPayment;
  }

  async getPayments(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepository.find({ where: { invoice: { id: invoiceId } }, relations: ['receivedBy'], order: { createdAt: 'DESC' } });
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