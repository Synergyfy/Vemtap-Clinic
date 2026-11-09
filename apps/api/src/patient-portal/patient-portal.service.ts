import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Patient } from '../entities/patient.entity';
import { Clinic } from '../entities/clinic.entity';
import { Branch } from '../entities/branch.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Payment, PaymentMethod } from '../entities/payment.entity';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto, RescheduleAppointmentDto, MakePaymentDto } from './dto';
import { EmailService } from '../common/services/email.service';
import { SmsService } from '../common/services/sms.service';

export interface PatientTokenPair {
  accessToken: string;
}

export interface PatientAuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicId: string | null;
}

@Injectable()
export class PatientPortalService {
  private readonly otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Clinic) private clinicRepo: Repository<Clinic>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async register(dto: PatientRegisterDto): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    const existing = await this.patientRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const { clinicId, branchId } = await this.resolveClinicAssociation(dto.clinicId, dto.branchId, dto.clinicQrCode);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const patient = this.patientRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth as any,
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email,
      patientPassword: hashedPassword,
      clinicId,
      branchId,
      patientType: 'private',
      portalAccessEnabled: true,
    });
    const saved = await this.patientRepo.save(patient);

    // Send welcome email
    await this.emailService.sendTemplatedEmail('welcome', saved.email, {
      firstName: saved.firstName,
      clinicName: 'Vemtap Health Clinic',
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/login`,
    });

    return this.generateToken(saved);
  }

  async login(dto: PatientLoginDto): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    const patient = await this.patientRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'patientPassword', 'clinicId', 'portalAccessEnabled'],
    });

    if (!patient || !patient.portalAccessEnabled) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, patient.patientPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(patient);
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; code?: string; messageId?: string; expiresAt?: string; error?: string }> {
    const normalizedPhone = this.normalizePhone(phone);
    const code = this.generateOtpCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const result = await this.smsService.sendOtpSms(normalizedPhone, code, 10);
    const allowLocalDebug = process.env.NODE_ENV !== 'production' && process.env.ALLOW_OTP_DEBUG === 'true';

    this.otpStore.set(normalizedPhone, { code, expiresAt });

    if (result.success) {
      return {
        success: true,
        messageId: result.messageId,
        expiresAt: new Date(expiresAt).toISOString(),
        code: allowLocalDebug ? code : undefined,
      };
    }

    const isMissingProviderConfig = /not configured|unsupported|No SMS provider configured/i.test(result.error || '');
    if (isMissingProviderConfig && allowLocalDebug) {
      console.log(`[OTP DEBUG] ${normalizedPhone} -> ${code}`);
      return {
        success: true,
        messageId: `local-otp-${Date.now()}`,
        expiresAt: new Date(expiresAt).toISOString(),
        code,
      };
    }

    return {
      success: false,
      error: result.error || 'Unable to send OTP.',
    };
  }

  async verifyPhoneOtp(phone: string, code: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhone(phone);
    const record = this.otpStore.get(normalizedPhone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(normalizedPhone);
      return false;
    }

    const isValid = record.code === code.trim();
    if (isValid) {
      this.otpStore.delete(normalizedPhone);
    }
    return isValid;
  }

  private normalizePhone(phone: string): string {
    const cleaned = String(phone ?? '').trim().replace(/\s+/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
      throw new BadRequestException('A valid phone number is required.');
    }
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  private generateOtpCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async resolveClinicAssociation(
    clinicId?: string,
    branchId?: string,
    clinicQrCode?: string,
  ): Promise<{ clinicId: string | null; branchId: string | null }> {
    let resolvedClinicId: string | null = clinicId ?? null;
    let resolvedBranchId: string | null = branchId ?? null;

    if (clinicQrCode) {
      const clinicFromQr = await this.clinicRepo.findOne({ where: { qrCode: clinicQrCode.trim() } });
      if (clinicFromQr) {
        resolvedClinicId = clinicFromQr.id;
      }
    }

    if (!resolvedClinicId) {
      return { clinicId: null, branchId: null };
    }

    if (!resolvedBranchId) {
      const defaultBranch = await this.branchRepo.findOne({
        where: { clinicId: resolvedClinicId, isActive: true },
        order: { createdAt: 'DESC' },
      });

      if (defaultBranch) {
        resolvedBranchId = defaultBranch.id;
        return { clinicId: resolvedClinicId, branchId: resolvedBranchId };
      }

      const clinicBranch = await this.branchRepo.findOne({
        where: { clinicId: resolvedClinicId },
        order: { createdAt: 'DESC' },
      });

      if (clinicBranch) {
        resolvedBranchId = clinicBranch.id;
      }
    }

    return { clinicId: resolvedClinicId, branchId: resolvedBranchId };
  }

  async getProfile(patientId: string) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new UnauthorizedException('Patient not found');
    const { patientPassword, ...result } = patient as any;
    return result;
  }

  async updateProfile(patientId: string, dto: UpdatePatientProfileDto) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new UnauthorizedException('Patient not found');
    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }

  async bookAppointment(patientId: string, dto: BookAppointmentDto) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new UnauthorizedException('Patient not found');
    if (!patient.clinicId) {
      throw new BadRequestException('This patient account is not linked to a clinic yet.');
    }

    const appointment = this.appointmentRepo.create({
      ...dto,
      patientId,
      clinicId: patient.clinicId,
      status: AppointmentStatus.SCHEDULED,
    });
    return this.appointmentRepo.save(appointment);
  }

  async getMyAppointments(patientId: string) {
    return this.appointmentRepo.find({
      where: { patientId },
      relations: ['staff', 'branch'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async getMyRecords(patientId: string) {
    return this.recordRepo.find({
      where: { patientId },
      relations: ['staff', 'vitals', 'eyeTests', 'prescriptions'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyBilling(patientId: string) {
    return this.invoiceRepo.find({
      where: { patientId },
      relations: ['payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async rescheduleAppointment(patientId: string, appointmentId: string, dto: RescheduleAppointmentDto) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId, patientId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.appointmentDate = dto.appointmentDate as any;
    if (dto.appointmentTime) {
      appointment.appointmentTime = dto.appointmentTime;
    }
    appointment.status = AppointmentStatus.SCHEDULED;
    return this.appointmentRepo.save(appointment);
  }

  async cancelAppointment(patientId: string, appointmentId: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId, patientId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

  async makePayment(patientId: string, dto: MakePaymentDto) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: dto.invoiceId, patientId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = this.invoiceRepo.manager.create(Payment, {
      invoiceId: dto.invoiceId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod as PaymentMethod,
      reference: dto.reference,
      notes: 'Patient portal payment',
      isSuccessful: true,
      clinicId: invoice.clinicId,
    });
    const savedPayment = await this.invoiceRepo.manager.save(payment);

    // Update invoice totals
    invoice.amountPaid += dto.amount;
    invoice.balance = invoice.totalAmount - invoice.amountPaid;
    if (invoice.balance <= 0) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }
    await this.invoiceRepo.save(invoice);

    return savedPayment;
  }

  private generateToken(patient: Patient): { tokens: PatientTokenPair; patient: PatientAuthUser } {
    const payload = { sub: patient.id, email: patient.email, type: 'patient' };
    const accessToken = this.jwtService.sign(payload);
    return {
      tokens: { accessToken },
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        clinicId: patient.clinicId,
      },
    };
  }
}