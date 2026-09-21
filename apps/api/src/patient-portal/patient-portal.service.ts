import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Payment, PaymentMethod } from '../entities/payment.entity';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto, RescheduleAppointmentDto, MakePaymentDto } from './dto';

export interface PatientTokenPair {
  accessToken: string;
}

export interface PatientAuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicId: string;
}

@Injectable()
export class PatientPortalService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private jwtService: JwtService,
  ) {}

  async register(dto: PatientRegisterDto): Promise<{ tokens: PatientTokenPair; patient: PatientAuthUser }> {
    const existing = await this.patientRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const patient = this.patientRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth as any,
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email,
      patientPassword: hashedPassword,
      clinicId: dto.clinicId,
      branchId: dto.branchId,
      patientType: 'private',
      portalAccessEnabled: true,
    });
    const saved = await this.patientRepo.save(patient);
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