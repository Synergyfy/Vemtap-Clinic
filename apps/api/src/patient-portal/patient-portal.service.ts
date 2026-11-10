import { randomUUID } from 'crypto';
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
import { PatientClinicMembership } from '../entities/patient-clinic-membership.entity';
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
  branchId: string | null;
}

@Injectable()
export class PatientPortalService {
  private readonly otpStore = new Map<string, { code: string; expiresAt: number }>();
  private readonly emailOtpStore = new Map<string, { code: string; expiresAt: number }>();
  private readonly familyActivationStore = new Map<string, {
    invitationId: string;
    guardianId: string;
    guardianName: string;
    email: string;
    fullName: string;
    relationship: 'child' | 'spouse' | 'parent' | 'other';
    expiresAt: number;
  }>();

  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Clinic) private clinicRepo: Repository<Clinic>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private jwtService?: JwtService,
    private emailService?: EmailService,
    private smsService?: SmsService,
    @InjectRepository(PatientClinicMembership)
    private patientClinicMembershipRepo?: Repository<PatientClinicMembership>,
  ) {}

  async register(dto: PatientRegisterDto): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    const normalizedEmail = String(dto.email ?? '').trim().toLowerCase();
    const normalizedPhone = this.normalizePhone(dto.phone);

    const existingByEmail = normalizedEmail
      ? await this.patientRepo.findOne({ where: { email: normalizedEmail } })
      : null;
    const existingByPhone = normalizedPhone
      ? await this.patientRepo.findOne({ where: { phone: normalizedPhone } })
      : null;

    if (existingByEmail && existingByPhone) {
      throw new ConflictException('An account with this email and phone number already exists. Please log in or use different registration details.');
    }
    if (existingByEmail) {
      throw new ConflictException('An account with this email already exists. Please log in or use a different email.');
    }
    if (existingByPhone) {
      throw new ConflictException('An account with this phone number already exists. Please log in or use a different phone number.');
    }

    const { clinicId, branchId } = await this.resolveClinicAssociation(dto.clinicId, dto.branchId, dto.clinicQrCode);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const patientData: Partial<Patient> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth as any,
      gender: dto.gender,
      phone: normalizedPhone,
      email: normalizedEmail,
      patientPassword: hashedPassword,
      clinicId,
      branchId,
      patientType: 'private',
      portalAccessEnabled: true,
    };
    const saved: Patient = await this.patientRepo.save(patientData as any);

    if (clinicId && this.patientClinicMembershipRepo) {
      await this.ensurePatientClinicMembership(saved.id, clinicId, branchId ?? null);
    }

    // Send welcome email only when an email address is available.
    if (saved.email) {
      await this.emailService!.sendTemplatedEmail('welcome', saved.email, {
        firstName: saved.firstName,
        clinicName: 'Vemtap Health Clinic',
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/login`,
      });
    }

    return this.generateToken(saved);
  }

  async login(dto: PatientLoginDto): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    const patient = await this.patientRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'patientPassword', 'clinicId', 'branchId', 'portalAccessEnabled'],
    });

    if (!patient || !patient.portalAccessEnabled) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, patient.patientPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const activeClinicMembership = this.patientClinicMembershipRepo
      ? await this.getPrimaryClinicMembership(patient.id)
      : null;

    if (activeClinicMembership) {
      patient.clinicId = activeClinicMembership.clinicId;
      patient.branchId = activeClinicMembership.branchId ?? patient.branchId ?? null;
    }

    return this.generateToken(patient);
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; code?: string; messageId?: string; expiresAt?: string; error?: string }> {
    const normalizedPhone = this.normalizePhone(phone);
    const code = this.generateOtpCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const result = await this.smsService!.sendOtpSms(normalizedPhone, code, 10);
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

  async sendEmailOtp(email: string): Promise<{ success: boolean; code?: string; messageId?: string; expiresAt?: string; error?: string }> {
    const normalizedEmail = this.normalizeEmail(email);
    const code = this.generateOtpCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const result = await this.emailService!.sendTemplatedEmail('otp-verification', normalizedEmail, {
      code,
      firstName: 'there',
    });
    const allowLocalDebug = process.env.NODE_ENV !== 'production' && process.env.ALLOW_OTP_DEBUG === 'true';

    this.emailOtpStore.set(normalizedEmail, { code, expiresAt });

    if (result.success) {
      return {
        success: true,
        messageId: result.messageId,
        expiresAt: new Date(expiresAt).toISOString(),
        code: allowLocalDebug ? code : undefined,
      };
    }

    if (allowLocalDebug) {
      console.log(`[EMAIL OTP DEBUG] ${normalizedEmail} -> ${code}`);
      return {
        success: true,
        messageId: `local-email-otp-${Date.now()}`,
        expiresAt: new Date(expiresAt).toISOString(),
        code,
      };
    }

    return {
      success: false,
      error: result.error || 'Unable to send verification email.',
    };
  }

  async createFamilyMemberInvite(
    guardianId: string,
    dto: { fullName: string; email: string; relationship: 'child' | 'spouse' | 'parent' | 'other' },
  ): Promise<{ success: boolean; invitationId: string; email: string; expiresAt: string; activationUrl: string }> {
    const guardian = await this.patientRepo.findOne({ where: { id: guardianId } });
    if (!guardian) {
      throw new NotFoundException('Guardian account not found. Please log in again and try again.');
    }

    const normalizedEmail = this.normalizeEmail(dto.email);
    const existingUser = await this.patientRepo.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new ConflictException('This family member already has an account. Please use a different email or ask them to log in.');
    }

    const fullName = String(dto.fullName || '').trim();
    if (!fullName) {
      throw new BadRequestException('A full name is required to send the activation link.');
    }

    const invitationId = randomUUID();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/family/activate?token=${invitationId}`;

    this.familyActivationStore.set(invitationId, {
      invitationId,
      guardianId,
      guardianName: `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'Your guardian',
      email: normalizedEmail,
      fullName,
      relationship: dto.relationship,
      expiresAt,
    });

    const emailResult = this.emailService?.sendTemplatedEmail
      ? await this.emailService.sendTemplatedEmail('family-activation', normalizedEmail, {
          firstName: fullName.split(/\s+/)[0] || 'there',
          fullName,
          guardianName: `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'Your guardian',
          relationship: dto.relationship,
          activationUrl,
          expiresAt: new Date(expiresAt).toISOString(),
        })
      : { success: true };

    if (emailResult && !emailResult.success) {
      this.familyActivationStore.delete(invitationId);
      throw new BadRequestException(emailResult.error || 'Unable to send the family activation email.');
    }

    return {
      success: true,
      invitationId,
      email: normalizedEmail,
      expiresAt: new Date(expiresAt).toISOString(),
      activationUrl,
    };
  }

  async activateFamilyMember(
    token: string,
    dto: { fullName: string; dateOfBirth: string; gender: string; phone: string; password: string },
  ): Promise<{ success: boolean; patient: Partial<Patient> }> {
    const invite = this.familyActivationStore.get(token);
    if (!invite) {
      throw new NotFoundException('This activation link is invalid or has already been used.');
    }
    if (Date.now() > invite.expiresAt) {
      this.familyActivationStore.delete(token);
      throw new BadRequestException('This activation link has expired. Please ask the guardian to resend it.');
    }

    const guardian = await this.patientRepo.findOne({ where: { id: invite.guardianId } });
    if (!guardian) {
      this.familyActivationStore.delete(token);
      throw new NotFoundException('The guardian account could not be found.');
    }

    const normalizedPhone = this.normalizePhone(dto.phone);
    const normalizedEmail = invite.email;
    const fullName = String(dto.fullName || '').trim();
    if (!fullName) {
      throw new BadRequestException('A full name is required for the family member account.');
    }

    const existingByEmail = await this.patientRepo.findOne({ where: { email: normalizedEmail } });
    const existingByPhone = await this.patientRepo.findOne({ where: { phone: normalizedPhone } });
    if (existingByEmail || existingByPhone) {
      this.familyActivationStore.delete(token);
      throw new ConflictException('This dependent already has an account. Please use a different email or phone number.');
    }

    const names = fullName.split(/\s+/);
    const firstName = names.shift() || 'Dependent';
    const lastName = names.join(' ') || 'Patient';

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const dependentData: Partial<Patient> = {
      firstName,
      lastName,
      dateOfBirth: dto.dateOfBirth as any,
      gender: dto.gender,
      phone: normalizedPhone,
      email: normalizedEmail,
      patientPassword: hashedPassword,
      portalAccessEnabled: true,
      patientType: 'private',
      clinicId: guardian.clinicId ?? null,
      branchId: guardian.branchId ?? null,
      guardianId: guardian.id,
      guardianRelationship: invite.relationship,
    };

    const saved: Patient = await this.patientRepo.save(dependentData as any);
    this.familyActivationStore.delete(token);

    if (this.emailService?.sendTemplatedEmail) {
      await this.emailService.sendTemplatedEmail('welcome', saved.email, {
        firstName: saved.firstName,
        clinicName: 'Vemtap Health Clinic',
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/login`,
      });
    }

    const { patientPassword, ...publicPatient } = saved as any;
    return {
      success: true,
      patient: {
        ...publicPatient,
        guardianId: guardian.id,
        guardianRelationship: invite.relationship,
      },
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

  async verifyEmailOtp(email: string, code: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const record = this.emailOtpStore.get(normalizedEmail);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.emailOtpStore.delete(normalizedEmail);
      return false;
    }

    const isValid = record.code === code.trim();
    if (isValid) {
      this.emailOtpStore.delete(normalizedEmail);
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

  private normalizeEmail(email: string): string {
    const normalized = String(email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new BadRequestException('A valid email address is required.');
    }
    return normalized;
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

  async getClinicMemberships(patientId: string) {
    if (!this.patientClinicMembershipRepo) {
      return [];
    }

    return this.patientClinicMembershipRepo.find({
      where: { patientId },
      relations: ['clinic', 'branch'],
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async getPrimaryClinicMembership(patientId: string) {
    if (!this.patientClinicMembershipRepo) {
      return null;
    }

    return this.patientClinicMembershipRepo.findOne({
      where: { patientId, isPrimary: true, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async ensurePatientClinicMembership(patientId: string, clinicId: string, branchId?: string | null) {
    if (!this.patientClinicMembershipRepo || !clinicId) {
      return { clinicId: clinicId ?? null, branchId: branchId ?? null };
    }

    const existing = await this.patientClinicMembershipRepo.findOne({
      where: { patientId, clinicId },
    });

    if (existing) {
      if (branchId && existing.branchId !== branchId) {
        existing.branchId = branchId;
        await this.patientClinicMembershipRepo.save(existing);
      }
      return {
        clinicId: existing.clinicId,
        branchId: existing.branchId ?? branchId ?? null,
        membershipId: existing.id,
      };
    }

    const allMemberships = await this.patientClinicMembershipRepo.find({ where: { patientId } });
    const saved = await this.patientClinicMembershipRepo.save(
      this.patientClinicMembershipRepo.create({
        patientId,
        clinicId,
        branchId: branchId ?? null,
        isPrimary: allMemberships.length === 0,
        isActive: true,
      }),
    );

    return {
      clinicId: saved.clinicId,
      branchId: saved.branchId ?? branchId ?? null,
      membershipId: saved.id,
    };
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
    const accessToken = this.jwtService!.sign(payload);
    return {
      tokens: { accessToken },
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        clinicId: patient.clinicId ?? null,
        branchId: patient.branchId ?? null,
      },
    };
  }
}