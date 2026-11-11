import { randomUUID } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { PatientFamilyInvitation } from '../entities/patient-family-invitation.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto, RescheduleAppointmentDto, MakePaymentDto } from './dto';
import { EmailService } from '../common/services/email.service';
import { SmsService } from '../common/services/sms.service';
import { resolvePatientProfileId } from '../common/patient-profile-access';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { UserRole } from '../entities/user.entity';

export interface PatientTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface FamilyProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone?: string | null;
  relationship: string;
  accountType: 'guardian' | 'dependent';
  isPrimary: boolean;
  status: 'active' | 'pending';
  invitationId?: string;
  expiresAt?: string;
  clinicId?: string | null;
  branchId?: string | null;
}

export interface FamilyInviteResult {
  success: boolean;
  patientId: string;
  email: string;
  emailSent: boolean;
  invitationId?: string;
  expiresAt?: string;
  activationUrl?: string;
}

export interface PatientAuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicId: string | null;
  branchId: string | null;
  guardianId?: string | null;
  guardianRelationship?: string | null;
  accountType?: 'individual' | 'guardian';
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
    patientId?: string | null;
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
    private config?: ConfigService,
    @InjectRepository(PatientFamilyInvitation)
    private familyInvitationRepo?: Repository<PatientFamilyInvitation>,
    @InjectRepository(LensOrder)
    private lensOrderRepo?: Repository<LensOrder>,
    private notificationsService?: NotificationsService,
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
    const accountType = dto.accountType === 'guardian' ? 'guardian' : 'individual';
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
      guardianRelationship: accountType === 'guardian' ? 'guardian' : undefined,
      guardianId: null,
    };
    const saved: Patient = await this.patientRepo.save(patientData as any);

    if (clinicId && this.patientClinicMembershipRepo) {
      await this.ensurePatientClinicMembership(saved.id, clinicId, branchId ?? null);
    }

    await this.notifyClinicStaff(
      clinicId,
      [UserRole.RECEPTIONIST, UserRole.CLINIC_ADMIN, UserRole.ADMIN],
      'New patient registered',
      `${this.displayName(saved)} created a patient portal account.`,
      NotificationType.SYSTEM,
    );

    // Send welcome email only when an email address is available, but do not block
    // registration on the external mail provider.
    if (saved.email && this.emailService?.sendTemplatedEmail) {
      void this.emailService.sendTemplatedEmail('welcome', saved.email, {
        firstName: saved.firstName,
        clinicName: 'Vemtap Health Clinic',
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/login`,
      }).catch((error) => {
        console.error('[patient-portal] welcome email failed:', error);
      });
    }

    return this.generateToken(saved);
  }

  async login(dto: PatientLoginDto): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    const patient = await this.patientRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'patientPassword', 'clinicId', 'branchId', 'guardianId', 'guardianRelationship', 'portalAccessEnabled'],
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
    dto: {
      fullName: string;
      email: string;
      relationship: 'child' | 'spouse' | 'parent' | 'other';
      dateOfBirth?: string;
      gender?: string;
      phone?: string;
      sendInvite?: boolean;
    },
  ): Promise<FamilyInviteResult> {
    const guardian = await this.patientRepo.findOne({ where: { id: guardianId } });
    if (!guardian) {
      throw new NotFoundException('Guardian account not found. Please log in again and try again.');
    }
    if (guardian.guardianId) {
      throw new ForbiddenException('Only the family owner can add family members.');
    }

    const normalizedEmail = this.normalizeEmail(dto.email);
    const existingUser = await this.patientRepo.findOne({ where: { email: normalizedEmail } });

    // A dependent created by a previous invite but not yet activated can be reused.
    const reusableDependent =
      existingUser &&
      existingUser.guardianId === guardianId &&
      !existingUser.portalAccessEnabled
        ? existingUser
        : null;

    if (existingUser && !reusableDependent) {
      throw new ConflictException(
        'This family member already has an account. Please use a different email or ask them to log in.',
      );
    }

    const fullName = String(dto.fullName || '').trim();
    if (!fullName) {
      throw new BadRequestException('A full name is required to add a family member.');
    }

    const names = fullName.split(/\s+/);
    const firstName = names.shift() || 'Dependent';
    const lastName = names.join(' ') || 'Patient';
    const normalizedPhone = dto.phone ? this.normalizePhone(dto.phone) : null;

    // Create the dependent profile immediately so the guardian can switch to it
    // without waiting for the activation email. Portal login stays disabled until
    // the family member activates their own account.
    const dependent = (
      reusableDependent
        ? await this.patientRepo.save(
            Object.assign(reusableDependent, {
              firstName,
              lastName,
              email: normalizedEmail,
              guardianId,
              guardianRelationship: dto.relationship,
              ...(dto.dateOfBirth ? { dateOfBirth: dto.dateOfBirth as any } : {}),
              ...(dto.gender ? { gender: dto.gender } : {}),
              ...(normalizedPhone ? { phone: normalizedPhone } : {}),
            }),
          )
        : await this.patientRepo.save(
            this.patientRepo.create({
              firstName,
              lastName,
              email: normalizedEmail,
              phone: normalizedPhone,
              dateOfBirth: (dto.dateOfBirth ?? null) as any,
              gender: dto.gender ?? 'other',
              patientType: 'private',
              portalAccessEnabled: false,
              clinicId: guardian.clinicId ?? null,
              branchId: guardian.branchId ?? null,
              guardianId: guardian.id,
              guardianRelationship: dto.relationship,
            } as any),
          )
    ) as Patient;

    if (dependent.clinicId && this.patientClinicMembershipRepo) {
      await this.ensurePatientClinicMembership(dependent.id, dependent.clinicId, dependent.branchId ?? null);
    }

    // Adding a family member is intentionally silent: the profile is usable
    // immediately and the activation email is only sent when the guardian asks
    // for it from the family profile screen.
    if (!dto.sendInvite) {
      return {
        success: true,
        patientId: dependent.id,
        email: normalizedEmail,
        emailSent: false,
      };
    }

    const invitation = await this.deliverFamilyInvitation(guardian, dependent, dto.relationship);
    return {
      success: true,
      patientId: dependent.id,
      email: normalizedEmail,
      ...invitation,
    };
  }

  /**
   * Sends (or resends) the activation email for a family profile that the
   * guardian added earlier. Only the guardian of the family group can do this.
   */
  async sendFamilyActivationInvite(actorId: string, patientId: string): Promise<FamilyInviteResult> {
    const actor = await this.patientRepo.findOne({ where: { id: actorId } });
    if (!actor) {
      throw new UnauthorizedException('Patient not found');
    }
    if (actor.guardianId) {
      throw new ForbiddenException('Only the guardian can send family invitations.');
    }

    const dependent = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!dependent) {
      throw new NotFoundException('Family member not found.');
    }
    if (dependent.guardianId !== actor.id) {
      throw new ForbiddenException('You do not have access to this family profile.');
    }
    if (dependent.portalAccessEnabled) {
      throw new BadRequestException('This family member has already activated their account.');
    }
    if (!dependent.email) {
      throw new BadRequestException('Add an email address for this family member before sending an invite.');
    }

    const relationship = (dependent.guardianRelationship || 'other') as
      | 'child'
      | 'spouse'
      | 'parent'
      | 'other';
    const invitation = await this.deliverFamilyInvitation(actor, dependent, relationship);
    if (!invitation.emailSent) {
      throw new BadRequestException(invitation.error || 'Unable to send the family activation email.');
    }

    return {
      success: true,
      patientId: dependent.id,
      email: dependent.email,
      ...invitation,
    };
  }

  private async deliverFamilyInvitation(
    guardian: Patient,
    dependent: Patient,
    relationship: string,
  ): Promise<{
    emailSent: boolean;
    invitationId?: string;
    expiresAt?: string;
    activationUrl?: string;
    error?: string;
  }> {
    const normalizedEmail = this.normalizeEmail(dependent.email);
    const fullName = `${dependent.firstName || ''} ${dependent.lastName || ''}`.trim() || 'Family member';
    const guardianName = `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'Your guardian';
    const invitationId = randomUUID();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/family/activate?token=${invitationId}`;

    if (this.familyInvitationRepo) {
      // Re-inviting the same address supersedes any earlier pending invitation.
      await this.familyInvitationRepo.update(
        { guardianId: guardian.id, email: normalizedEmail, used: false },
        { used: true },
      );
      await this.familyInvitationRepo.save(
        this.familyInvitationRepo.create({
          guardianId: guardian.id,
          clinicId: guardian.clinicId ?? null,
          patientId: dependent.id,
          fullName,
          email: normalizedEmail,
          relationship,
          token: invitationId,
          expiresAt: new Date(expiresAt),
          used: false,
        }),
      );
    } else {
      this.familyActivationStore.set(invitationId, {
        invitationId,
        guardianId: guardian.id,
        guardianName,
        email: normalizedEmail,
        fullName,
        relationship: relationship as 'child' | 'spouse' | 'parent' | 'other',
        patientId: dependent.id,
        expiresAt,
      });
    }

    const emailResult = this.emailService?.sendTemplatedEmail
      ? await this.emailService.sendTemplatedEmail('family-activation', normalizedEmail, {
          firstName: fullName.split(/\s+/)[0] || 'there',
          fullName,
          guardianName,
          relationship,
          activationUrl,
          expiresAt: new Date(expiresAt).toISOString(),
        })
      : { success: true };

    const emailSent = !(emailResult && !emailResult.success);

    if (!emailSent) {
      // The profile is already usable by the guardian, so keep it. The invitation
      // token is removed because it was never delivered.
      if (this.familyInvitationRepo) {
        await this.familyInvitationRepo.delete({ token: invitationId });
      } else {
        this.familyActivationStore.delete(invitationId);
      }
      return {
        emailSent: false,
        error: emailResult?.error || 'Unable to send the family activation email.',
      };
    }

    return {
      emailSent: true,
      invitationId,
      expiresAt: new Date(expiresAt).toISOString(),
      activationUrl,
    };
  }

  async activateFamilyMember(
    token: string,
    dto: { fullName: string; dateOfBirth: string; gender: string; phone: string; password: string },
  ): Promise<{ success: boolean; patient: Partial<Patient> }> {
    const invite = await this.findFamilyInvitation(token);
    if (!invite) {
      throw new NotFoundException('This activation link is invalid or has already been used.');
    }
    if (Date.now() > invite.expiresAt) {
      await this.discardFamilyInvitation(token);
      throw new BadRequestException('This activation link has expired. Please ask the guardian to resend it.');
    }

    const guardian = await this.patientRepo.findOne({ where: { id: invite.guardianId } });
    if (!guardian) {
      await this.discardFamilyInvitation(token);
      throw new NotFoundException('The guardian account could not be found.');
    }

    const normalizedPhone = this.normalizePhone(dto.phone);
    const normalizedEmail = invite.email;
    const fullName = String(dto.fullName || '').trim();
    if (!fullName) {
      throw new BadRequestException('A full name is required for the family member account.');
    }

    const names = fullName.split(/\s+/);
    const firstName = names.shift() || 'Dependent';
    const lastName = names.join(' ') || 'Patient';
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const linkedPatient = invite.patientId
      ? await this.patientRepo.findOne({ where: { id: invite.patientId } })
      : null;

    if (linkedPatient && linkedPatient.guardianId !== guardian.id) {
      await this.discardFamilyInvitation(token);
      throw new ConflictException('This family member profile is no longer linked to your account.');
    }

    const phoneOwner = await this.patientRepo.findOne({ where: { phone: normalizedPhone } });
    if (phoneOwner && phoneOwner.id !== linkedPatient?.id) {
      await this.discardFamilyInvitation(token);
      throw new ConflictException('This phone number is already linked to another patient account.');
    }

    let saved: Patient;
    if (linkedPatient) {
      // Upgrade the profile that the guardian already added to a full login account.
      Object.assign(linkedPatient, {
        firstName,
        lastName,
        dateOfBirth: dto.dateOfBirth as any,
        gender: dto.gender,
        phone: normalizedPhone,
        email: normalizedEmail,
        patientPassword: hashedPassword,
        portalAccessEnabled: true,
        clinicId: linkedPatient.clinicId ?? guardian.clinicId ?? null,
        branchId: linkedPatient.branchId ?? guardian.branchId ?? null,
        guardianId: guardian.id,
        guardianRelationship: invite.relationship,
      });
      saved = await this.patientRepo.save(linkedPatient);
    } else {
      const existingByEmail = await this.patientRepo.findOne({ where: { email: normalizedEmail } });
      const existingByPhone = await this.patientRepo.findOne({ where: { phone: normalizedPhone } });
      if (existingByEmail || existingByPhone) {
        await this.discardFamilyInvitation(token);
        throw new ConflictException('This dependent already has an account. Please use a different email or phone number.');
      }

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

      saved = await this.patientRepo.save(dependentData as any);
    }

    if (saved.clinicId && this.patientClinicMembershipRepo) {
      await this.ensurePatientClinicMembership(saved.id, saved.clinicId, saved.branchId ?? null);
    }
    await this.consumeFamilyInvitation(token);

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

  private async notifyPatient(
    patientId: string,
    clinicId: string | null | undefined,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    try {
      await this.notificationsService?.create({
        title,
        message,
        type,
        patientId,
        clinicId: clinicId ?? undefined,
      });
    } catch {
      // Notifications are best-effort; never fail the patient action.
    }
  }

  private async notifyClinicStaff(
    clinicId: string | null | undefined,
    roles: UserRole[],
    title: string,
    message: string,
    type: NotificationType,
  ) {
    try {
      await this.notificationsService?.notifyClinicRoles(clinicId, roles, { title, message, type });
    } catch {
      // Notifications are best-effort; never fail the patient action.
    }
  }

  private async notifyAssignedStaff(
    staffId: string | null | undefined,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    try {
      await this.notificationsService?.notifyAssignedStaff(staffId, { title, message, type });
    } catch {
      // Notifications are best-effort; never fail the patient action.
    }
  }

  private displayName(patient: Pick<Patient, 'firstName' | 'lastName'> | null | undefined) {
    const name = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ').trim();
    return name || 'A patient';
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
    const saved = await this.appointmentRepo.save(appointment);

    const when = `${new Date(saved.appointmentDate).toLocaleDateString()}${
      saved.appointmentTime ? ` at ${saved.appointmentTime}` : ''
    }`;

    await this.notifyPatient(
      patientId,
      patient.clinicId,
      'Appointment booked',
      `Your appointment on ${when} has been booked.`,
      NotificationType.APPOINTMENT,
    );
    await this.notifyClinicStaff(
      patient.clinicId,
      [UserRole.RECEPTIONIST, UserRole.ADMIN],
      'New appointment request',
      `${this.displayName(patient)} booked an appointment on ${when}.`,
      NotificationType.APPOINTMENT,
    );
    await this.notifyAssignedStaff(
      saved.staffId,
      'New appointment',
      `${this.displayName(patient)} booked an appointment with you on ${when}.`,
      NotificationType.APPOINTMENT,
    );

    return saved;
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

  async getMyLensOrders(patientId: string) {
    if (!this.lensOrderRepo) return [];
    return this.lensOrderRepo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
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
    const saved = await this.appointmentRepo.save(appointment);

    const when = `${new Date(saved.appointmentDate).toLocaleDateString()}${
      saved.appointmentTime ? ` at ${saved.appointmentTime}` : ''
    }`;
    const patient = await this.patientRepo.findOne({
      where: { id: appointment.patientId },
      select: ['firstName', 'lastName'],
    });

    await this.notifyPatient(
      patientId,
      appointment.clinicId,
      'Appointment rescheduled',
      `Your appointment is now ${when}.`,
      NotificationType.APPOINTMENT,
    );
    await this.notifyClinicStaff(
      appointment.clinicId,
      [UserRole.RECEPTIONIST, UserRole.ADMIN],
      'Appointment rescheduled',
      `${this.displayName(patient)} moved an appointment to ${when}.`,
      NotificationType.APPOINTMENT,
    );
    await this.notifyAssignedStaff(
      appointment.staffId,
      'Appointment rescheduled',
      `${this.displayName(patient)} moved their appointment to ${when}.`,
      NotificationType.APPOINTMENT,
    );

    return saved;
  }

  async cancelAppointment(patientId: string, appointmentId: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId, patientId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.status = AppointmentStatus.CANCELLED;
    const saved = await this.appointmentRepo.save(appointment);

    const when = new Date(saved.appointmentDate).toLocaleDateString();
    const patient = await this.patientRepo.findOne({
      where: { id: appointment.patientId },
      select: ['firstName', 'lastName'],
    });

    await this.notifyPatient(
      patientId,
      appointment.clinicId,
      'Appointment cancelled',
      `Your appointment on ${when} was cancelled.`,
      NotificationType.APPOINTMENT,
    );
    await this.notifyClinicStaff(
      appointment.clinicId,
      [UserRole.RECEPTIONIST, UserRole.ADMIN],
      'Appointment cancelled',
      `${this.displayName(patient)} cancelled an appointment on ${when}.`,
      NotificationType.APPOINTMENT,
    );
    await this.notifyAssignedStaff(
      appointment.staffId,
      'Appointment cancelled',
      `${this.displayName(patient)} cancelled their appointment on ${when}.`,
      NotificationType.APPOINTMENT,
    );

    return saved;
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

    await this.notifyPatient(
      patientId,
      invoice.clinicId,
      'Payment received',
      `We received a payment of ₦${Number(dto.amount).toLocaleString()} for invoice ${invoice.invoiceNumber}.`,
      NotificationType.BILLING,
    );
    await this.notifyClinicStaff(
      invoice.clinicId,
      [UserRole.CASHIER, UserRole.CLINIC_ADMIN, UserRole.ADMIN],
      'Payment received',
      `Payment of ₦${Number(dto.amount).toLocaleString()} was made online for invoice ${invoice.invoiceNumber}.`,
      NotificationType.BILLING,
    );

    return savedPayment;
  }

  async getFamilyProfiles(
    patientId: string,
  ): Promise<{ primary: FamilyProfile | null; members: FamilyProfile[]; pendingInvites: FamilyProfile[] }> {
    const viewer = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!viewer) {
      throw new UnauthorizedException('Patient not found');
    }

    const guardianId = viewer.guardianId ?? viewer.id;
    const guardian = guardianId === viewer.id ? viewer : await this.patientRepo.findOne({ where: { id: guardianId } });
    const primary = guardian ? this.toFamilyProfile(guardian, true) : null;

    const now = Date.now();
    const pendingSource = this.familyInvitationRepo
      ? (
          await this.familyInvitationRepo.find({
            where: { guardianId, used: false },
            order: { createdAt: 'DESC' },
          })
        ).map((invite) => ({
          invitationId: invite.token,
          guardianId: invite.guardianId,
          email: invite.email,
          fullName: invite.fullName,
          relationship: invite.relationship,
          patientId: invite.patientId ?? null,
          expiresAt:
            invite.expiresAt instanceof Date ? invite.expiresAt.getTime() : new Date(invite.expiresAt).getTime(),
        }))
      : [...this.familyActivationStore.values()];

    const dependents = guardian
      ? await this.patientRepo.find({
          where: { guardianId: guardian.id },
          order: { createdAt: 'ASC' },
        })
      : [];
    const dependentIds = new Set(dependents.map((dependent) => dependent.id));
    const knownEmails = new Set(
      [guardian?.email, ...dependents.map((dependent) => dependent.email)]
        .filter(Boolean)
        .map((email) => String(email).toLowerCase()),
    );

    // Older invitations were stored before the dependent profile existed. Create
    // those profiles now so every added family member is immediately selectable.
    if (guardian) {
      for (const invite of pendingSource) {
        if (
          invite.guardianId !== guardianId ||
          invite.expiresAt <= now ||
          (invite.patientId && dependentIds.has(invite.patientId)) ||
          knownEmails.has(String(invite.email).toLowerCase())
        ) {
          continue;
        }

        const names = invite.fullName.split(/\s+/);
        const firstName = names.shift() || 'Dependent';
        const lastName = names.join(' ') || 'Patient';

        try {
          const created = (await this.patientRepo.save(
            this.patientRepo.create({
              firstName,
              lastName,
              email: invite.email,
              phone: null,
              dateOfBirth: null,
              gender: 'other',
              patientType: 'private',
              portalAccessEnabled: false,
              clinicId: guardian.clinicId ?? null,
              branchId: guardian.branchId ?? null,
              guardianId: guardian.id,
              guardianRelationship: invite.relationship,
            } as any),
          )) as unknown as Patient;

          dependents.push(created);
          dependentIds.add(created.id);
          knownEmails.add(String(invite.email).toLowerCase());
          invite.patientId = created.id;

          if (this.familyInvitationRepo) {
            await this.familyInvitationRepo.update({ token: invite.invitationId }, { patientId: created.id });
          }
        } catch {
          // Leave the invitation in the pending list if the profile cannot be created.
        }
      }
    }

    const members = dependents.map((dependent) =>
      this.toFamilyProfile(dependent, false, dependent.guardianRelationship),
    );

    const pendingInvites: FamilyProfile[] = [];

    for (const invite of pendingSource) {
      if (
        invite.guardianId !== guardianId ||
        invite.expiresAt <= now ||
        (invite.patientId && dependentIds.has(invite.patientId)) ||
        knownEmails.has(String(invite.email).toLowerCase())
      ) {
        continue;
      }

      const names = invite.fullName.split(/\s+/);
      const firstName = names.shift() ?? '';
      pendingInvites.push({
        id: invite.invitationId,
        firstName,
        lastName: names.join(' '),
        fullName: invite.fullName,
        email: invite.email,
        relationship: invite.relationship,
        accountType: 'dependent',
        isPrimary: false,
        status: 'pending',
        invitationId: invite.invitationId,
        expiresAt: new Date(invite.expiresAt).toISOString(),
      });
    }

    return { primary, members, pendingInvites };
  }

  /**
   * Resolves which patient's data a guarded request should touch. A guardian (or
   * any activated dependent) may switch to another profile in the same family
   * group via the `X-Patient-Id` header; anything outside that group is rejected.
   */
  async resolvePatientId(actorId: string, requestedId?: string | null): Promise<string> {
    return resolvePatientProfileId(this.patientRepo, actorId, requestedId);
  }

  async refreshSession(refreshToken?: string): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: { sub?: string; type?: string };
    try {
      payload = this.jwtService!.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload?.type !== 'patient-refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const patient = await this.patientRepo.findOne({ where: { id: payload.sub } });
    if (!patient || !patient.portalAccessEnabled) {
      throw new UnauthorizedException('Patient not found or inactive');
    }

    return this.generateToken(patient);
  }

  private async findFamilyInvitation(token: string): Promise<{
    invitationId: string;
    guardianId: string;
    email: string;
    fullName: string;
    relationship: 'child' | 'spouse' | 'parent' | 'other';
    patientId?: string | null;
    expiresAt: number;
  } | null> {
    if (this.familyInvitationRepo) {
      const invite = await this.familyInvitationRepo.findOne({ where: { token } });
      if (!invite || invite.used) return null;

      return {
        invitationId: invite.token,
        guardianId: invite.guardianId,
        email: invite.email,
        fullName: invite.fullName,
        relationship: invite.relationship as 'child' | 'spouse' | 'parent' | 'other',
        patientId: invite.patientId ?? null,
        expiresAt:
          invite.expiresAt instanceof Date ? invite.expiresAt.getTime() : new Date(invite.expiresAt).getTime(),
      };
    }

    return this.familyActivationStore.get(token) ?? null;
  }

  private async consumeFamilyInvitation(token: string): Promise<void> {
    if (this.familyInvitationRepo) {
      await this.familyInvitationRepo.update({ token }, { used: true });
      return;
    }
    this.familyActivationStore.delete(token);
  }

  private async discardFamilyInvitation(token: string): Promise<void> {
    if (this.familyInvitationRepo) {
      await this.familyInvitationRepo.delete({ token });
      return;
    }
    this.familyActivationStore.delete(token);
  }

  private toFamilyProfile(patient: Patient, isPrimary: boolean, relationship?: string): FamilyProfile {
    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim(),
      email: patient.email ?? null,
      phone: patient.phone ?? null,
      relationship: isPrimary ? 'guardian' : relationship || 'dependent',
      accountType: isPrimary ? 'guardian' : 'dependent',
      isPrimary,
      status: isPrimary || patient.portalAccessEnabled ? 'active' : 'pending',
      clinicId: patient.clinicId ?? null,
      branchId: patient.branchId ?? null,
    };
  }

  private generateToken(patient: Patient): { tokens: PatientTokenPair; patient: PatientAuthUser } {
    const payload = { sub: patient.id, email: patient.email, type: 'patient' };
    const accessExpiresIn = this.config?.get<string>('PATIENT_ACCESS_EXPIRES_IN') ?? '1h';
    const refreshExpiresIn =
      this.config?.get<string>('PATIENT_REFRESH_EXPIRES_IN') ??
      this.config?.get<string>('JWT_REFRESH_EXPIRES_IN') ??
      '7d';
    const accessToken = this.jwtService!.sign(payload, { expiresIn: accessExpiresIn as any });
    const refreshToken = this.jwtService!.sign(
      { sub: patient.id, type: 'patient-refresh' },
      { expiresIn: refreshExpiresIn as any },
    );
    const accountType = patient.guardianRelationship === 'guardian' ? 'guardian' : 'individual';

    return {
      tokens: { accessToken, refreshToken },
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        clinicId: patient.clinicId ?? null,
        branchId: patient.branchId ?? null,
        guardianId: patient.guardianId ?? null,
        guardianRelationship: patient.guardianRelationship ?? null,
        accountType,
      },
    };
  }
}