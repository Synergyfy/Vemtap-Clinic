import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async notifyPatient(
    appointment: Pick<Appointment, 'patientId' | 'clinicId' | 'appointmentDate' | 'appointmentTime'>,
    title: string,
    message: string,
  ) {
    try {
      await this.notificationsService.create({
        title,
        message,
        type: NotificationType.APPOINTMENT,
        patientId: appointment.patientId,
        clinicId: appointment.clinicId,
      });
    } catch {
      // Notifications are best-effort; never fail the appointment action.
    }
  }

  /** Alerts the assigned clinician plus the front desk for their own clinic. */
  private async notifyStaff(
    appointment: Pick<Appointment, 'staffId' | 'clinicId'>,
    title: string,
    message: string,
  ) {
    try {
      await Promise.all([
        this.notificationsService.notifyAssignedStaff(appointment.staffId, {
          title,
          message,
          type: NotificationType.APPOINTMENT,
        }),
        this.notificationsService.notifyClinicRoles(appointment.clinicId, [UserRole.RECEPTIONIST, UserRole.ADMIN], {
          title,
          message,
          type: NotificationType.APPOINTMENT,
        }),
      ]);
    } catch {
      // Notifications are best-effort; never fail the appointment action.
    }
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const conflict = await this.appointmentRepository.findOne({
      where: {
        staffId: dto.staffId,
        appointmentDate: dto.appointmentDate as any,
        status: AppointmentStatus.SCHEDULED,
      },
    });
    if (conflict) {
      throw new ConflictException('Staff member has an appointment at this time');
    }
    const appointment = this.appointmentRepository.create(dto);
    const saved = await this.appointmentRepository.save(appointment);

    const when = `${new Date(saved.appointmentDate).toLocaleDateString()}${
      saved.appointmentTime ? ` at ${saved.appointmentTime}` : ''
    }`;

    await this.notifyPatient(
      saved,
      'Appointment scheduled',
      `An appointment was scheduled for you on ${when}.`,
    );
    await this.notifyStaff(saved, 'New appointment', `An appointment was scheduled on ${when}.`);

    return saved;
  }

  async findAll(query: AppointmentQueryDto): Promise<{ data: Appointment[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.staffId) where.staffId = query.staffId;
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    if (query.startDate && query.endDate) {
      where.appointmentDate = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 100);
    const sortBy = ['appointmentDate', 'appointmentTime', 'createdAt', 'status'].includes(query.sortBy ?? '')
      ? (query.sortBy as keyof Appointment)
      : 'appointmentDate';
    const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await this.appointmentRepository.findAndCount({
      where,
      relations: ['patient', 'staff', 'branch'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'staff', 'branch', 'clinic'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, dto);
    const saved = await this.appointmentRepository.save(appointment);

    if (dto.status || dto.appointmentDate || dto.appointmentTime) {
      const cancelled = saved.status === AppointmentStatus.CANCELLED;
      const when = `${new Date(saved.appointmentDate).toLocaleDateString()}${
        saved.appointmentTime ? ` at ${saved.appointmentTime}` : ''
      }`;

      await this.notifyPatient(
        saved,
        cancelled ? 'Appointment cancelled' : 'Appointment updated',
        cancelled ? `Your appointment on ${when} was cancelled.` : `Your appointment is now ${when}.`,
      );
      await this.notifyStaff(
        saved,
        cancelled ? 'Appointment cancelled' : 'Appointment rescheduled',
        cancelled ? `The appointment on ${when} was cancelled.` : `An appointment was moved to ${when}.`,
      );
    }

    return saved;
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  async getToday(clinicId: string): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointmentRepository.find({
      where: {
        clinicId,
        appointmentDate: Between(today, tomorrow),
      },
      relations: ['patient', 'staff'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async getAvailableSlots(staffId: string, date: string) {
    const booked = await this.appointmentRepository.find({
      where: {
        staffId,
        appointmentDate: date as any,
        status: AppointmentStatus.SCHEDULED,
      },
      select: ['appointmentTime'],
    });
    const bookedTimes = booked.map(a => a.appointmentTime);
    const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    return allSlots.filter(slot => !bookedTimes.includes(slot));
  }

  async getStats(clinicId: string) {
    const total = await this.appointmentRepository.count({ where: { clinicId } });
    const scheduled = await this.appointmentRepository.count({ where: { clinicId, status: AppointmentStatus.SCHEDULED } });
    const completed = await this.appointmentRepository.count({ where: { clinicId, status: AppointmentStatus.COMPLETED } });
    const cancelled = await this.appointmentRepository.count({ where: { clinicId, status: AppointmentStatus.CANCELLED } });
    return { total, scheduled, completed, cancelled };
  }

  async getCalendarView(clinicId: string, startDate: string, endDate: string) {
    const appointments = await this.appointmentRepository.find({
      where: {
        clinicId,
        appointmentDate: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['patient', 'staff'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });

    const calendar: Record<string, any[]> = {};
    for (const appt of appointments) {
      const dateKey = new Date(appt.appointmentDate).toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push({
        id: appt.id,
        time: appt.appointmentTime,
        patient: appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'Unknown',
        staff: appt.staff ? `${appt.staff.firstName} ${appt.staff.lastName}` : 'Unknown',
        status: appt.status,
        type: appt.type,
      });
    }
    return calendar;
  }
}
