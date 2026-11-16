import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClinicSubscription,
  BillingCycle,
  SubscriptionStatus,
} from '../entities/clinic-subscription.entity';
import { SubscriptionPlan, PlanLimits } from '../entities/subscription-plan.entity';
import {
  SubscriptionInvoice,
  SubscriptionInvoiceStatus,
} from '../entities/subscription-invoice.entity';
import {
  SubscriptionPayment,
  SubscriptionPaymentProvider,
  SubscriptionPaymentStatus,
} from '../entities/subscription-payment.entity';
import { SubscriptionEvent, SubscriptionEventType } from '../entities/subscription-event.entity';
import { UsageCounter, UsageMetric } from '../entities/usage-counter.entity';
import { Clinic } from '../entities/clinic.entity';
import { Patient } from '../entities/patient.entity';
import { Staff } from '../entities/staff.entity';
import { Branch } from '../entities/branch.entity';
import { FileUpload } from '../entities/file-upload.entity';
import { NotificationType } from '../entities/notification.entity';
import { UserRole } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentService } from '../common/services/payment.service';
import { DEFAULT_PLANS } from './plan-catalog';
import {
  AdminListSubscriptionsQueryDto,
  AdminOverrideSubscriptionDto,
  CancelSubscriptionDto,
  CreateSubscriptionPlanDto,
  DowngradeSubscriptionDto,
  ListSubscriptionInvoicesQueryDto,
  RecordManualSubscriptionPaymentDto,
  UpdateSubscriptionPlanDto,
  UpgradeSubscriptionDto,
} from './dto';

export type SubscriptionAccessLevel = 'full' | 'restricted' | 'read_only';

export interface LimitCheckResult {
  allowed: boolean;
  metric: UsageMetric;
  used: number;
  limit: number | null;
  projected: number;
  warning: boolean;
  message?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_DAYS = [14, 7, 3, 0];

const addMonths = (date: Date, months: number): Date => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const addYears = (date: Date, years: number): Date => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

const periodKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

@Injectable()
export class SubscriptionsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly graceDays: number;
  private readonly enforcement: 'soft' | 'hard';

  constructor(
    @InjectRepository(ClinicSubscription)
    private readonly subscriptionRepo: Repository<ClinicSubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
    @InjectRepository(SubscriptionPayment)
    private readonly paymentRepo: Repository<SubscriptionPayment>,
    @InjectRepository(SubscriptionEvent)
    private readonly eventRepo: Repository<SubscriptionEvent>,
    @InjectRepository(UsageCounter)
    private readonly usageRepo: Repository<UsageCounter>,
    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(FileUpload)
    private readonly fileRepo: Repository<FileUpload>,
    private readonly notifications: NotificationsService,
    private readonly paymentService: PaymentService,
    private readonly config: ConfigService
  ) {
    this.graceDays = Number(this.config.get('SUBSCRIPTION_GRACE_DAYS') ?? 14);
    const mode = String(this.config.get('SUBSCRIPTION_ENFORCEMENT') ?? 'soft').toLowerCase();
    this.enforcement = mode === 'hard' ? 'hard' : 'soft';
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaultPlans();
    await this.backfillClinicSubscriptions();
  }

  /**
   * Every clinic must own a subscription row. Clinics created before §16 shipped
   * (and clinics created without going through the API) are adopted here on
   * boot, inheriting `Clinic.plan` when it matches a known plan code.
   */
  async backfillClinicSubscriptions(): Promise<number> {
    const clinics = await this.clinicRepo.find();
    if (clinics.length === 0) return 0;

    const existing = await this.subscriptionRepo.find({ select: { clinicId: true } });
    const subscribed = new Set(existing.map(row => row.clinicId));
    const missing = clinics.filter(clinic => !subscribed.has(clinic.id));
    if (missing.length === 0) return 0;

    const plans = await this.planRepo.find();
    const byCode = new Map(plans.map(plan => [plan.code, plan]));
    const fallback = byCode.get('free') ?? plans[0];
    if (!fallback) return 0;

    const now = new Date();
    const end = addMonths(now, 1);
    let created = 0;

    for (const clinic of missing) {
      const plan = (clinic.plan && byCode.get(clinic.plan)) || fallback;
      const subscription = await this.subscriptionRepo.save(
        this.subscriptionRepo.create({
          clinicId: clinic.id,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          currentPeriodStart: now,
          currentPeriodEnd: end,
          renewalDate: end,
          priceSnapshot: Number(plan.monthlyPrice),
          currency: plan.currency,
        })
      );
      await this.logEvent(clinic.id, subscription.id, SubscriptionEventType.CREATED, null, {
        planCode: plan.code,
        backfilled: true,
      });
      created += 1;
    }

    this.logger.log(`Backfilled ${created} clinic subscription(s)`);
    return created;
  }

  // ---------------------------------------------------------------------------
  // Plans
  // ---------------------------------------------------------------------------

  async seedDefaultPlans(): Promise<void> {
    for (const definition of DEFAULT_PLANS) {
      const existing = await this.planRepo.findOne({ where: { code: definition.code } });
      if (existing) continue;
      await this.planRepo.save(
        this.planRepo.create({
          code: definition.code,
          name: definition.name,
          description: definition.description,
          monthlyPrice: definition.monthlyPrice,
          yearlyPrice: definition.yearlyPrice,
          currency: definition.currency,
          limits: definition.limits,
          features: definition.features,
          sortOrder: definition.sortOrder,
          isActive: true,
        })
      );
      this.logger.log(`Seeded subscription plan "${definition.code}"`);
    }
  }

  listPlans(includeInactive = false): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({
      where: includeInactive ? {} : { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getPlanByCode(code: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { code } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException(`Subscription plan "${code}" not found`);
    }
    return plan;
  }

  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const existing = await this.planRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Plan "${dto.code}" already exists`);
    return this.planRepo.save(this.planRepo.create({ ...dto }));
  }

  async updatePlan(code: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { code } });
    if (!plan) throw new NotFoundException(`Subscription plan "${code}" not found`);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  // ---------------------------------------------------------------------------
  // Subscription lifecycle
  // ---------------------------------------------------------------------------

  async ensureSubscription(clinicId: string): Promise<ClinicSubscription> {
    let subscription = await this.subscriptionRepo.findOne({
      where: { clinicId },
      relations: ['plan', 'pendingPlan'],
    });
    if (subscription) return subscription;

    const plan = await this.getPlanByCode('free');
    const now = new Date();
    const end = addMonths(now, 1);
    subscription = await this.subscriptionRepo.save(
      this.subscriptionRepo.create({
        clinicId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        renewalDate: end,
        priceSnapshot: Number(plan.monthlyPrice),
        currency: plan.currency,
      })
    );
    subscription.plan = plan;
    await this.logEvent(clinicId, subscription.id, SubscriptionEventType.CREATED, null, {
      planCode: plan.code,
      auto: true,
    });
    return subscription;
  }

  private accessLevel(subscription: ClinicSubscription): SubscriptionAccessLevel {
    switch (subscription.status) {
      case SubscriptionStatus.ACTIVE:
      case SubscriptionStatus.TRIALING:
      case SubscriptionStatus.PAST_DUE:
        return 'full';
      case SubscriptionStatus.GRACE:
        return 'restricted';
      case SubscriptionStatus.EXPIRED:
      case SubscriptionStatus.CANCELLED:
      default:
        return 'read_only';
    }
  }

  async getEntitlements(clinicId: string) {
    const subscription = await this.ensureSubscription(clinicId);
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      accessLevel: this.accessLevel(subscription),
      plan: subscription.plan,
      limits: subscription.plan?.limits ?? ({} as PlanLimits),
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      renewalDate: subscription.renewalDate,
      graceEndsAt: subscription.graceEndsAt,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      enforcement: this.enforcement,
    };
  }

  async getCurrent(clinicId: string) {
    const subscription = await this.ensureSubscription(clinicId);
    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        renewalDate: subscription.renewalDate,
        graceEndsAt: subscription.graceEndsAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        cancelledAt: subscription.cancelledAt,
        priceSnapshot: Number(subscription.priceSnapshot),
        currency: subscription.currency,
      },
      plan: subscription.plan,
      pendingPlan: subscription.pendingPlan ?? null,
      pendingBillingCycle: subscription.pendingBillingCycle,
      accessLevel: this.accessLevel(subscription),
      limits: subscription.plan?.limits ?? {},
      usage: await this.getUsage(clinicId),
      enforcement: this.enforcement,
    };
  }

  async upgrade(clinicId: string, dto: UpgradeSubscriptionDto, actorId?: string) {
    const subscription = await this.ensureSubscription(clinicId);
    const plan = await this.getPlanByCode(dto.planCode);
    const cycle = dto.billingCycle ?? BillingCycle.MONTHLY;

    if (
      subscription.planId === plan.id &&
      subscription.billingCycle === cycle &&
      !subscription.pendingPlanId
    ) {
      throw new BadRequestException('The clinic is already on this plan and billing cycle');
    }
    if (plan.sortOrder < (subscription.plan?.sortOrder ?? 0)) {
      throw new BadRequestException('Use the downgrade endpoint to move to a lower plan');
    }

    const previousPlanCode = subscription.plan?.code ?? null;
    const now = new Date();
    const end = cycle === BillingCycle.YEARLY ? addYears(now, 1) : addMonths(now, 1);
    const amount = Number(cycle === BillingCycle.YEARLY ? plan.yearlyPrice : plan.monthlyPrice);

    const invoice = await this.createInvoice(subscription, plan, cycle, amount, now, end);

    // A paid plan only takes effect once the money arrives: until then the clinic
    // keeps its current entitlements. Free plans apply immediately.
    if (amount > 0) {
      subscription.pendingPlanId = plan.id;
      subscription.pendingPlan = plan;
      subscription.pendingBillingCycle = cycle;
      subscription.pendingPlanAwaitingPayment = true;
      await this.subscriptionRepo.save(subscription);

      await this.logEvent(
        clinicId,
        subscription.id,
        SubscriptionEventType.UPGRADED,
        actorId ?? null,
        {
          from: previousPlanCode,
          to: plan.code,
          billingCycle: cycle,
          amount,
          pending: true,
          invoiceId: invoice.id,
        }
      );

      const payment = await this.createPendingPayment(
        invoice,
        SubscriptionPaymentProvider.PAYSTACK
      );
      let authorizationUrl: string | undefined;
      if (this.paymentService.isPaystackConfigured) {
        const clinic = await this.clinicRepo.findOne({ where: { id: clinicId } });
        const init = await this.paymentService.initializePayment({
          amount,
          currency: plan.currency,
          reference: payment.reference as string,
          customerEmail: clinic?.email ?? `billing+${clinicId}@vemtap.local`,
          customerName: clinic?.name ?? 'Clinic',
          callbackUrl: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/clinic/subscription?reference=${payment.reference}`,
          metadata: { invoiceId: invoice.id, clinicId, planCode: plan.code, billingCycle: cycle },
        });
        if (init.success) authorizationUrl = init.authorizationUrl;
        else this.logger.warn(`Paystack init failed for ${invoice.invoiceNumber}: ${init.error}`);
      }

      return {
        subscription: await this.getCurrent(clinicId),
        invoice,
        payment: {
          reference: payment.reference,
          amount,
          currency: plan.currency,
          authorizationUrl,
          requiresPayment: true,
        },
      };
    }

    this.applyPlan(subscription, plan, cycle, amount, now, end);
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.graceEndsAt = null;
    subscription.cancelAtPeriodEnd = false;
    subscription.cancelledAt = null;
    subscription.pendingPlanId = null;
    subscription.pendingPlan = null;
    subscription.pendingBillingCycle = null;
    subscription.pendingPlanAwaitingPayment = false;
    await this.subscriptionRepo.save(subscription);

    await this.logEvent(
      clinicId,
      subscription.id,
      SubscriptionEventType.UPGRADED,
      actorId ?? null,
      {
        from: previousPlanCode,
        to: plan.code,
        billingCycle: cycle,
        amount,
      }
    );
    await this.notifyAdmins(
      clinicId,
      'Subscription updated',
      `Your clinic is now on the ${plan.name} plan (${cycle}).`
    );

    return {
      subscription: await this.getCurrent(clinicId),
      invoice,
      payment: {
        reference: null,
        amount,
        currency: plan.currency,
        authorizationUrl: undefined,
        requiresPayment: false,
      },
    };
  }

  /** Copies the new plan onto the subscription and starts a fresh period. */
  private applyPlan(
    subscription: ClinicSubscription,
    plan: SubscriptionPlan,
    cycle: BillingCycle,
    amount: number,
    periodStart: Date,
    periodEnd: Date
  ): void {
    subscription.planId = plan.id;
    subscription.plan = plan;
    subscription.billingCycle = cycle;
    subscription.priceSnapshot = amount;
    subscription.currency = plan.currency;
    subscription.currentPeriodStart = periodStart;
    subscription.currentPeriodEnd = periodEnd;
    subscription.renewalDate = periodEnd;
  }

  async downgrade(clinicId: string, dto: DowngradeSubscriptionDto, actorId?: string) {
    const subscription = await this.ensureSubscription(clinicId);
    const plan = await this.getPlanByCode(dto.planCode);
    const cycle = dto.billingCycle ?? subscription.billingCycle;

    if (plan.sortOrder > (subscription.plan?.sortOrder ?? 0)) {
      throw new BadRequestException('Use the upgrade endpoint to move to a higher plan');
    }

    subscription.pendingPlanId = plan.id;
    subscription.pendingPlan = plan;
    subscription.pendingBillingCycle = cycle;
    subscription.pendingPlanAwaitingPayment = false;
    await this.subscriptionRepo.save(subscription);

    await this.logEvent(
      clinicId,
      subscription.id,
      SubscriptionEventType.DOWNGRADED,
      actorId ?? null,
      {
        from: subscription.plan?.code ?? null,
        to: plan.code,
        billingCycle: cycle,
        effectiveAt: subscription.currentPeriodEnd,
      }
    );
    await this.notifyAdmins(
      clinicId,
      'Downgrade scheduled',
      `Your clinic will move to the ${plan.name} plan on ${subscription.currentPeriodEnd?.toISOString() ?? 'renewal'}.`
    );

    return this.getCurrent(clinicId);
  }

  async cancel(clinicId: string, dto: CancelSubscriptionDto, actorId?: string) {
    const subscription = await this.ensureSubscription(clinicId);

    if (dto.immediate) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.cancelAtPeriodEnd = true;
    }
    await this.subscriptionRepo.save(subscription);

    await this.logEvent(
      clinicId,
      subscription.id,
      SubscriptionEventType.CANCELLED,
      actorId ?? null,
      {
        immediate: Boolean(dto.immediate),
        reason: dto.reason ?? null,
        effectiveAt: dto.immediate ? new Date() : subscription.currentPeriodEnd,
      }
    );
    await this.notifyAdmins(
      clinicId,
      'Cancellation requested',
      dto.immediate
        ? 'Your subscription has been cancelled. Existing records remain accessible.'
        : `Your subscription will end on ${subscription.currentPeriodEnd?.toISOString() ?? 'the renewal date'}.`
    );

    return this.getCurrent(clinicId);
  }

  // ---------------------------------------------------------------------------
  // Invoices and payments
  // ---------------------------------------------------------------------------

  private async createInvoice(
    subscription: ClinicSubscription,
    plan: SubscriptionPlan,
    cycle: BillingCycle,
    amount: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SubscriptionInvoice> {
    const count = await this.invoiceRepo.count({ where: { clinicId: subscription.clinicId } });
    const invoiceNumber = `SUB-${new Date().getFullYear()}-${subscription.clinicId.slice(0, 8)}-${String(count + 1).padStart(4, '0')}`;
    return this.invoiceRepo.save(
      this.invoiceRepo.create({
        invoiceNumber,
        clinicId: subscription.clinicId,
        subscriptionId: subscription.id,
        amount,
        currency: plan.currency,
        status: amount > 0 ? SubscriptionInvoiceStatus.PENDING : SubscriptionInvoiceStatus.PAID,
        periodStart,
        periodEnd,
        dueDate: periodStart,
        paidAt: amount > 0 ? null : periodStart,
        notes: `${plan.name} plan (${cycle})`,
      })
    );
  }

  private async createPendingPayment(
    invoice: SubscriptionInvoice,
    provider: SubscriptionPaymentProvider
  ): Promise<SubscriptionPayment> {
    const reference = `sub_${invoice.id.replace(/-/g, '').slice(0, 20)}_${Date.now()}`;
    return this.paymentRepo.save(
      this.paymentRepo.create({
        invoiceId: invoice.id,
        clinicId: invoice.clinicId,
        amount: Number(invoice.amount),
        method: provider === SubscriptionPaymentProvider.PAYSTACK ? 'card' : 'manual',
        provider,
        reference,
        status: SubscriptionPaymentStatus.PENDING,
      })
    );
  }

  async listInvoices(clinicId: string, query: ListSubscriptionInvoicesQueryDto = {}) {
    const [items, total] = await this.invoiceRepo.findAndCount({
      where: { clinicId, ...(query.status ? { status: query.status } : {}) },
      order: { createdAt: 'DESC' },
      take: query.limit ?? 50,
      skip: query.offset ?? 0,
    });
    return { items, total };
  }

  async payInvoice(clinicId: string, invoiceId: string) {
    if (!this.paymentService.isPaystackConfigured) {
      throw new BadRequestException('Paystack is not configured on this platform');
    }

    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId, clinicId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === SubscriptionInvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    const payment = await this.createPendingPayment(invoice, SubscriptionPaymentProvider.PAYSTACK);
    const clinic = await this.clinicRepo.findOne({ where: { id: clinicId } });
    const init = await this.paymentService.initializePayment({
      amount: Number(invoice.amount),
      currency: invoice.currency,
      reference: payment.reference as string,
      customerEmail: clinic?.email ?? `billing+${clinicId}@vemtap.local`,
      customerName: clinic?.name ?? 'Clinic',
      callbackUrl: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/clinic/subscription?reference=${payment.reference}`,
      metadata: { invoiceId: invoice.id, clinicId },
    });

    if (!init.success) {
      payment.status = SubscriptionPaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      throw new BadRequestException(init.error ?? 'Unable to initialize payment');
    }

    return { reference: payment.reference, authorizationUrl: init.authorizationUrl };
  }

  async verifyPayment(clinicId: string, reference: string, actorId?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { reference, clinicId },
      relations: ['invoice'],
    });
    if (!payment) throw new NotFoundException('Payment reference not found');

    if (payment.status === SubscriptionPaymentStatus.SUCCESS) {
      return { alreadyProcessed: true, subscription: await this.getCurrent(clinicId) };
    }

    const result = await this.paymentService.verifyPayment({ reference });
    if (!result.success || result.status !== 'success') {
      payment.status = SubscriptionPaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      await this.logEvent(
        clinicId,
        payment.invoice?.subscriptionId ?? null,
        SubscriptionEventType.PAYMENT_FAILED,
        actorId ?? null,
        {
          reference,
          error: result.error ?? null,
        }
      );
      throw new BadRequestException(result.error ?? 'Payment was not successful');
    }

    await this.settleInvoice(payment.invoice, payment, actorId ?? null);
    return { alreadyProcessed: false, subscription: await this.getCurrent(clinicId) };
  }

  private async settleInvoice(
    invoice: SubscriptionInvoice,
    payment: SubscriptionPayment,
    actorId: string | null
  ): Promise<void> {
    const now = new Date();
    invoice.status = SubscriptionInvoiceStatus.PAID;
    invoice.paidAt = now;
    await this.invoiceRepo.save(invoice);

    payment.status = SubscriptionPaymentStatus.SUCCESS;
    payment.paidAt = now;
    await this.paymentRepo.save(payment);

    const subscription = await this.ensureSubscription(invoice.clinicId);

    let end: Date;
    if (subscription.pendingPlanId) {
      // A paid upgrade requested mid-period: the new plan starts when the invoice
      // was raised, not when the previous period would have ended.
      const plan = await this.planRepo.findOne({ where: { id: subscription.pendingPlanId } });
      const cycle = subscription.pendingBillingCycle ?? subscription.billingCycle;
      const periodStart = invoice.periodStart ?? now;
      end =
        invoice.periodEnd ??
        (cycle === BillingCycle.YEARLY ? addYears(periodStart, 1) : addMonths(periodStart, 1));
      if (plan) {
        this.applyPlan(subscription, plan, cycle, Number(invoice.amount), periodStart, end);
      } else {
        subscription.billingCycle = cycle;
        subscription.currentPeriodStart = periodStart;
        subscription.currentPeriodEnd = end;
        subscription.renewalDate = end;
      }
      subscription.pendingPlanId = null;
      subscription.pendingPlan = null;
      subscription.pendingBillingCycle = null;
      subscription.pendingPlanAwaitingPayment = false;
    } else {
      const base =
        subscription.currentPeriodEnd && subscription.currentPeriodEnd > now
          ? subscription.currentPeriodEnd
          : now;
      end =
        subscription.billingCycle === BillingCycle.YEARLY ? addYears(base, 1) : addMonths(base, 1);
      subscription.currentPeriodStart = base;
      subscription.currentPeriodEnd = end;
      subscription.renewalDate = end;
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.graceEndsAt = null;
    subscription.cancelAtPeriodEnd = false;
    await this.subscriptionRepo.save(subscription);

    await this.logEvent(invoice.clinicId, subscription.id, SubscriptionEventType.RENEWED, actorId, {
      invoiceId: invoice.id,
      reference: payment.reference,
      periodEnd: end,
    });
    await this.notifyAdmins(
      invoice.clinicId,
      'Subscription renewed',
      `Payment received for invoice ${invoice.invoiceNumber}. Your plan is active until ${end.toISOString()}.`
    );
  }

  async recordManualPayment(
    clinicId: string,
    invoiceId: string,
    dto: RecordManualSubscriptionPaymentDto,
    actorId?: string
  ) {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId, clinicId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        invoiceId: invoice.id,
        clinicId,
        amount: Number(invoice.amount),
        method: dto.method ?? 'manual',
        provider: SubscriptionPaymentProvider.MANUAL,
        reference: dto.reference,
        status: SubscriptionPaymentStatus.PENDING,
        recordedById: dto.recordedById ?? actorId ?? null,
      })
    );

    await this.settleInvoice(invoice, payment, actorId ?? null);
    return { invoice, payment };
  }

  async handlePaystackWebhook(signature: string | undefined, rawBody: Buffer | undefined) {
    if (!signature || !rawBody) {
      throw new BadRequestException('Missing Paystack signature or body');
    }
    if (!this.paymentService.isPaystackConfigured) {
      throw new BadRequestException('Paystack is not configured');
    }
    if (!this.paymentService.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid JSON payload');
    }

    if (event?.event === 'charge.success' && event?.data?.reference) {
      const payment = await this.paymentRepo.findOne({
        where: { reference: event.data.reference },
        relations: ['invoice'],
      });
      if (payment && payment.invoice && payment.invoice.status !== SubscriptionInvoiceStatus.PAID) {
        await this.settleInvoice(payment.invoice, payment, null);
      }
    }

    return { received: true };
  }

  // ---------------------------------------------------------------------------
  // Usage and soft enforcement
  // ---------------------------------------------------------------------------

  async getUsage(clinicId: string) {
    const period = periodKey(new Date());
    const [patients, staff, branches, storage, counters] = await Promise.all([
      this.patientRepo.count({ where: { clinicId } }),
      this.staffRepo.count({ where: { clinicId } }),
      this.branchRepo.count({ where: { clinicId } }),
      this.fileRepo
        .createQueryBuilder('file')
        .select('COALESCE(SUM(file.fileSize), 0)', 'bytes')
        .where('file.clinicId = :clinicId', { clinicId })
        .getRawOne<{ bytes: string }>(),
      this.usageRepo.find({ where: { clinicId, period } }),
    ]);

    const counterValue = (metric: UsageMetric): number =>
      Number(counters.find(counter => counter.metric === metric)?.used ?? 0);

    return {
      period,
      patients,
      staff,
      branches,
      storageMb: Math.ceil(Number(storage?.bytes ?? 0) / (1024 * 1024)),
      ocr: counterValue(UsageMetric.OCR),
      whatsapp: counterValue(UsageMetric.WHATSAPP),
    };
  }

  private limitFor(limits: PlanLimits, metric: UsageMetric): number | null {
    switch (metric) {
      case UsageMetric.PATIENTS:
        return limits.maxPatients ?? null;
      case UsageMetric.STAFF:
        return limits.maxStaff ?? null;
      case UsageMetric.BRANCHES:
        return limits.maxBranches ?? null;
      case UsageMetric.OCR:
        return limits.ocrPerMonth ?? null;
      case UsageMetric.WHATSAPP:
        return limits.whatsappPerMonth ?? null;
      case UsageMetric.STORAGE_MB:
        return limits.storageMb ?? null;
      default:
        return null;
    }
  }

  /** Targeted count for one metric — cheaper than `getUsage` on a write path. */
  private async currentUsageFor(clinicId: string, metric: UsageMetric): Promise<number> {
    switch (metric) {
      case UsageMetric.PATIENTS:
        return this.patientRepo.count({ where: { clinicId } });
      case UsageMetric.STAFF:
        return this.staffRepo.count({ where: { clinicId } });
      case UsageMetric.BRANCHES:
        return this.branchRepo.count({ where: { clinicId } });
      case UsageMetric.STORAGE_MB: {
        const storage = await this.fileRepo
          .createQueryBuilder('file')
          .select('COALESCE(SUM(file.fileSize), 0)', 'bytes')
          .where('file.clinicId = :clinicId', { clinicId })
          .getRawOne<{ bytes: string }>();
        return Math.ceil(Number(storage?.bytes ?? 0) / (1024 * 1024));
      }
      case UsageMetric.OCR:
      case UsageMetric.WHATSAPP: {
        const period = periodKey(new Date());
        const counter = await this.usageRepo.findOne({
          where: { clinicId, metric, period },
        });
        return Number(counter?.used ?? 0);
      }
      default:
        return 0;
    }
  }

  /**
   * Soft enforcement (default): warns and records a `limit_reached` event but
   * still allows the action. Flip `SUBSCRIPTION_ENFORCEMENT=hard` to block.
   *
   * Never throws on an internal error — billing must not break clinical work.
   */
  async checkLimit(
    clinicId: string,
    metric: UsageMetric,
    requestedAmount = 1
  ): Promise<LimitCheckResult> {
    try {
      return await this.evaluateLimit(clinicId, metric, requestedAmount);
    } catch (error) {
      // Billing must never break a clinical workflow (emergency care above all).
      this.logger.warn(`Limit check failed for ${metric}: ${(error as Error).message}`);
      return {
        allowed: true,
        metric,
        used: 0,
        limit: null,
        projected: requestedAmount,
        warning: false,
      };
    }
  }

  /**
   * Same check, but turns a blocked action into a structured 403 so the UI can
   * offer an upgrade. Under soft enforcement it never throws.
   */
  async assertLimit(
    clinicId: string,
    metric: UsageMetric,
    requestedAmount = 1
  ): Promise<LimitCheckResult> {
    const result = await this.checkLimit(clinicId, metric, requestedAmount);
    if (!result.allowed) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'LIMIT_REACHED',
        metric: result.metric,
        used: result.used,
        limit: result.limit,
        message: result.message,
      });
    }
    return result;
  }

  private async evaluateLimit(
    clinicId: string,
    metric: UsageMetric,
    requestedAmount: number
  ): Promise<LimitCheckResult> {
    const entitlements = await this.getEntitlements(clinicId);
    const limit = this.limitFor(entitlements.limits, metric);
    const used = await this.currentUsageFor(clinicId, metric);
    const projected = used + requestedAmount;

    if (limit === null || limit === undefined || projected <= limit) {
      return { allowed: true, metric, used, limit: limit ?? null, projected, warning: false };
    }

    const message = `${metric} limit reached (${used}/${limit}). Upgrade the clinic plan to continue.`;
    await this.logLimitReachedOnce(clinicId, entitlements.subscriptionId, metric, used, limit);
    await this.notifyAdmins(clinicId, 'Plan limit reached', message);

    return {
      allowed: this.enforcement === 'hard' ? false : true,
      metric,
      used,
      limit,
      projected,
      warning: true,
      message,
    };
  }

  async recordUsage(clinicId: string, metric: UsageMetric, amount = 1): Promise<number> {
    const period = periodKey(new Date());
    const result = await this.usageRepo.query(
      `INSERT INTO "usage_counters" ("clinicId", "metric", "period", "used")
       VALUES ($1, CAST($2 AS "usage_counters_metric_enum"), $3, $4)
       ON CONFLICT ("clinicId", "metric", "period")
       DO UPDATE SET "used" = "usage_counters"."used" + EXCLUDED."used"
       RETURNING "used"`,
      [clinicId, metric, period, amount]
    );
    return Number(result?.[0]?.used ?? 0);
  }

  private async logLimitReachedOnce(
    clinicId: string,
    subscriptionId: string,
    metric: UsageMetric,
    used: number,
    limit: number
  ): Promise<void> {
    const period = periodKey(new Date());
    const existing = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.clinicId = :clinicId', { clinicId })
      .andWhere('event.type = :type', { type: SubscriptionEventType.LIMIT_REACHED })
      .andWhere("event.metadata ->> 'metric' = :metric", { metric })
      .andWhere("event.metadata ->> 'period' = :period", { period })
      .getCount();
    if (existing > 0) return;
    await this.logEvent(clinicId, subscriptionId, SubscriptionEventType.LIMIT_REACHED, null, {
      metric,
      used,
      limit,
      period,
    });
  }

  // ---------------------------------------------------------------------------
  // Expiry sweep
  // ---------------------------------------------------------------------------

  async sweepExpirations(now = new Date()): Promise<{ processed: number }> {
    const subscriptions = await this.subscriptionRepo.find({
      where: {},
      relations: ['plan', 'pendingPlan'],
    });

    let processed = 0;
    for (const subscription of subscriptions) {
      if (!subscription.currentPeriodEnd) continue;

      const periodEnd = subscription.currentPeriodEnd;
      const overdue = periodEnd.getTime() <= now.getTime();

      if (!overdue) {
        await this.sendRenewalReminders(subscription, now);
        continue;
      }

      // A downgrade the clinic scheduled earlier takes effect at the boundary.
      // An upgrade awaiting payment is not applied here — only a settled invoice
      // may grant a paid plan.
      if (subscription.pendingPlanId && !subscription.pendingPlanAwaitingPayment) {
        processed += (await this.applyScheduledPlan(subscription, now)) ? 1 : 0;
        continue;
      }

      switch (subscription.status) {
        case SubscriptionStatus.ACTIVE:
        case SubscriptionStatus.TRIALING:
          subscription.status = SubscriptionStatus.PAST_DUE;
          subscription.graceEndsAt = new Date(now.getTime() + this.graceDays * DAY_MS);
          await this.subscriptionRepo.save(subscription);
          await this.logEvent(
            subscription.clinicId,
            subscription.id,
            SubscriptionEventType.PAST_DUE,
            null,
            {
              periodEnd,
            }
          );
          await this.notifyAdmins(
            subscription.clinicId,
            'Subscription payment due',
            `Your subscription period ended on ${periodEnd.toISOString()}. A grace period is active until ${subscription.graceEndsAt.toISOString()}.`
          );
          processed += 1;
          break;

        case SubscriptionStatus.PAST_DUE:
          // Full access is kept until the grace window closes; only then does the
          // plan expire. Records are never removed either way.
          if (subscription.graceEndsAt && subscription.graceEndsAt.getTime() <= now.getTime()) {
            subscription.status = SubscriptionStatus.EXPIRED;
            await this.subscriptionRepo.save(subscription);
            await this.logEvent(
              subscription.clinicId,
              subscription.id,
              SubscriptionEventType.EXPIRED,
              null,
              {
                graceEndsAt: subscription.graceEndsAt,
              }
            );
            await this.notifyAdmins(
              subscription.clinicId,
              'Subscription expired',
              'Your subscription has expired. Patient records and clinical history remain accessible; new paid features are restricted until renewal.'
            );
            processed += 1;
          }
          break;

        case SubscriptionStatus.GRACE:
          if (subscription.graceEndsAt && subscription.graceEndsAt.getTime() <= now.getTime()) {
            subscription.status = SubscriptionStatus.EXPIRED;
            await this.subscriptionRepo.save(subscription);
            await this.logEvent(
              subscription.clinicId,
              subscription.id,
              SubscriptionEventType.EXPIRED,
              null,
              {
                graceEndsAt: subscription.graceEndsAt,
              }
            );
            await this.notifyAdmins(
              subscription.clinicId,
              'Subscription expired',
              'Your subscription has expired. Patient records and clinical history remain accessible; new paid features are restricted until renewal.'
            );
            processed += 1;
          }
          break;

        default:
          break;
      }

      if (subscription.cancelAtPeriodEnd && subscription.status !== SubscriptionStatus.CANCELLED) {
        subscription.status = SubscriptionStatus.CANCELLED;
        subscription.cancelledAt = now;
        await this.subscriptionRepo.save(subscription);
        processed += 1;
      }
    }

    return { processed };
  }

  /**
   * Applies a downgrade the clinic scheduled for the end of its period and
   * bills the new plan. A free target plan simply renews with full access.
   */
  private async applyScheduledPlan(subscription: ClinicSubscription, now: Date): Promise<boolean> {
    const plan = await this.planRepo.findOne({
      where: { id: subscription.pendingPlanId as string },
    });
    if (!plan) {
      subscription.pendingPlanId = null;
      subscription.pendingPlan = null;
      subscription.pendingBillingCycle = null;
      subscription.pendingPlanAwaitingPayment = false;
      await this.subscriptionRepo.save(subscription);
      return false;
    }

    const cycle = subscription.pendingBillingCycle ?? subscription.billingCycle;
    const amount = Number(cycle === BillingCycle.YEARLY ? plan.yearlyPrice : plan.monthlyPrice);
    const end = cycle === BillingCycle.YEARLY ? addYears(now, 1) : addMonths(now, 1);
    const previousPlanCode = subscription.plan?.code ?? null;

    this.applyPlan(subscription, plan, cycle, amount, now, end);
    subscription.pendingPlanId = null;
    subscription.pendingPlan = null;
    subscription.pendingBillingCycle = null;
    subscription.pendingPlanAwaitingPayment = false;
    subscription.cancelAtPeriodEnd = false;

    if (amount === 0) {
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.graceEndsAt = null;
    } else {
      subscription.status = SubscriptionStatus.PAST_DUE;
      subscription.graceEndsAt = new Date(now.getTime() + this.graceDays * DAY_MS);
    }
    await this.subscriptionRepo.save(subscription);

    await this.logEvent(
      subscription.clinicId,
      subscription.id,
      SubscriptionEventType.DOWNGRADED,
      null,
      {
        from: previousPlanCode,
        to: plan.code,
        billingCycle: cycle,
        amount,
        applied: true,
      }
    );

    if (amount > 0) {
      await this.createInvoice(subscription, plan, cycle, amount, now, end);
    }
    await this.notifyAdmins(
      subscription.clinicId,
      'Plan changed',
      amount === 0
        ? `Your clinic has moved to the ${plan.name} plan.`
        : `Your clinic has moved to the ${plan.name} plan. An invoice for the new period is available.`
    );
    return true;
  }

  private async sendRenewalReminders(subscription: ClinicSubscription, now: Date): Promise<void> {
    if (!subscription.currentPeriodEnd) return;
    if (subscription.status === SubscriptionStatus.CANCELLED) return;

    const daysUntil = Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / DAY_MS);
    if (!REMINDER_DAYS.includes(daysUntil)) return;

    const alreadySent = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.clinicId = :clinicId', { clinicId: subscription.clinicId })
      .andWhere('event.type = :type', { type: SubscriptionEventType.REMINDER_SENT })
      .andWhere("event.metadata ->> 'daysUntil' = :days", { days: String(daysUntil) })
      .andWhere("event.metadata ->> 'periodEnd' = :periodEnd", {
        periodEnd: subscription.currentPeriodEnd.toISOString(),
      })
      .getCount();
    if (alreadySent > 0) return;

    await this.logEvent(
      subscription.clinicId,
      subscription.id,
      SubscriptionEventType.REMINDER_SENT,
      null,
      {
        daysUntil,
        periodEnd: subscription.currentPeriodEnd.toISOString(),
      }
    );
    await this.notifyAdmins(
      subscription.clinicId,
      'Subscription renewal reminder',
      daysUntil === 0
        ? 'Your subscription renews today. Please settle the invoice to avoid interruption.'
        : `Your subscription renews in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`
    );
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  async adminListSubscriptions(query: AdminListSubscriptionsQueryDto = {}) {
    const qb = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.clinic', 'clinic')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .orderBy('subscription.createdAt', 'DESC')
      .take(query.limit ?? 50)
      .skip(query.offset ?? 0);

    if (query.status) qb.andWhere('subscription.status = :status', { status: query.status });
    if (query.planCode) qb.andWhere('plan.code = :planCode', { planCode: query.planCode });
    if (query.search) qb.andWhere('clinic.name ILIKE :search', { search: `%${query.search}%` });

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async adminOverride(clinicId: string, dto: AdminOverrideSubscriptionDto, actorId?: string) {
    const subscription = await this.ensureSubscription(clinicId);

    if (dto.planCode) {
      const plan = await this.getPlanByCode(dto.planCode);
      subscription.planId = plan.id;
      subscription.plan = plan;
    }
    if (dto.status) subscription.status = dto.status;
    if (typeof dto.extendGraceDays === 'number') {
      const base =
        subscription.graceEndsAt && subscription.graceEndsAt > new Date()
          ? subscription.graceEndsAt
          : new Date();
      subscription.graceEndsAt = new Date(base.getTime() + dto.extendGraceDays * DAY_MS);
    }
    if (dto.currentPeriodEnd) {
      subscription.currentPeriodEnd = new Date(dto.currentPeriodEnd);
      subscription.renewalDate = subscription.currentPeriodEnd;
    }

    await this.subscriptionRepo.save(subscription);
    await this.logEvent(
      clinicId,
      subscription.id,
      SubscriptionEventType.OVERRIDE,
      actorId ?? null,
      {
        changes: dto,
      }
    );
    await this.notifyAdmins(
      clinicId,
      'Subscription updated by Vemtap',
      'Your clinic subscription was updated by a platform administrator.'
    );
    return this.getCurrent(clinicId);
  }

  async adminStats() {
    const rows = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .select('subscription.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subscription.status')
      .getRawMany<{ status: string; count: string }>();

    const active = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .where('subscription.status IN (:...statuses)', {
        statuses: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
      })
      .getMany();

    const mrr = active.reduce((sum, subscription) => {
      const monthly = Number(subscription.priceSnapshot ?? 0);
      return sum + (subscription.billingCycle === BillingCycle.YEARLY ? monthly / 12 : monthly);
    }, 0);

    return {
      byStatus: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = Number(row.count);
        return acc;
      }, {}),
      totalSubscriptions: rows.reduce((sum, row) => sum + Number(row.count), 0),
      mrr: Math.round(mrr * 100) / 100,
    };
  }

  async listEvents(clinicId: string, limit = 50) {
    return this.eventRepo.find({
      where: { clinicId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async logEvent(
    clinicId: string,
    subscriptionId: string | null,
    type: SubscriptionEventType,
    actorId: string | null,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.eventRepo.save(
        this.eventRepo.create({
          clinicId,
          subscriptionId,
          type,
          actorId,
          metadata: metadata ?? null,
        })
      );
    } catch (error) {
      this.logger.warn(`Failed to record subscription event ${type}: ${(error as Error).message}`);
    }
  }

  private async notifyAdmins(clinicId: string, title: string, message: string): Promise<void> {
    try {
      await this.notifications.notifyClinicRoles(
        clinicId,
        [UserRole.CLINIC_ADMIN, UserRole.ADMIN],
        { title, message, type: NotificationType.SYSTEM }
      );
    } catch {
      // Notifications are best-effort; never fail a billing action.
    }
  }
}
