import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Invoice } from '../entities/invoice.entity';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto } from './dto';

@Injectable()
export class PatientPortalService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private jwtService: JwtService,
  ) {}

  async register(dto: PatientRegisterDto) {
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

  async login(dto: PatientLoginDto) {
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

  private generateToken(patient: Patient) {
    const payload = { sub: patient.id, email: patient.email, type: 'patient' };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
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
