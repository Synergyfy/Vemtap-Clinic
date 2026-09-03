import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { SurgicalProcedure, ProcedureCategory } from '../entities/surgical-procedure.entity';
import { OperatingRoom, RoomStatus } from '../entities/operating-room.entity';
import { SurgerySchedule, SurgeryStatus } from '../entities/surgery-schedule.entity';
import { CreateProcedureDto, UpdateProcedureDto, ProcedureQueryDto } from './dto';
import { CreateOperatingRoomDto, UpdateOperatingRoomDto, OperatingRoomQueryDto } from './dto';
import { CreateSurgeryScheduleDto, UpdateSurgeryScheduleDto, SurgeryScheduleQueryDto, AvailableSlotsDto } from './dto';

@Injectable()
export class SurgeryService {
  constructor(
    @InjectRepository(SurgicalProcedure) private procedureRepo: Repository<SurgicalProcedure>,
    @InjectRepository(OperatingRoom) private roomRepo: Repository<OperatingRoom>,
    @InjectRepository(SurgerySchedule) private scheduleRepo: Repository<SurgerySchedule>,
  ) {}

  // ========== Procedures ==========
  async createProcedure(dto: CreateProcedureDto, clinicId: string): Promise<SurgicalProcedure> {
    const count = await this.procedureRepo.count({ where: { clinicId } });
    const procedure = this.procedureRepo.create({
      ...dto,
      clinicId,
    });
    return this.procedureRepo.save(procedure);
  }

  async findProcedures(query: ProcedureQueryDto): Promise<SurgicalProcedure[]> {
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.procedureRepo.find({ where, order: { name: 'ASC' } });
  }

  async findProcedureById(id: string): Promise<SurgicalProcedure> {
    const procedure = await this.procedureRepo.findOne({ where: { id }, relations: ['clinic'] });
    if (!procedure) throw new NotFoundException('Procedure not found');
    return procedure;
  }

  async updateProcedure(id: string, dto: UpdateProcedureDto): Promise<SurgicalProcedure> {
    const procedure = await this.findProcedureById(id);
    Object.assign(procedure, dto);
    return this.procedureRepo.save(procedure);
  }

  async deleteProcedure(id: string): Promise<void> {
    const procedure = await this.findProcedureById(id);
    await this.procedureRepo.remove(procedure);
  }

  // ========== Operating Rooms ==========
  async createOperatingRoom(dto: CreateOperatingRoomDto, clinicId: string): Promise<OperatingRoom> {
    const room = this.roomRepo.create({ ...dto, clinicId });
    return this.roomRepo.save(room);
  }

  async findOperatingRooms(query: OperatingRoomQueryDto): Promise<OperatingRoom[]> {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.roomRepo.find({ where, relations: ['schedules'], order: { name: 'ASC' } });
  }

  async findOperatingRoomById(id: string): Promise<OperatingRoom> {
    const room = await this.roomRepo.findOne({ where: { id }, relations: ['clinic', 'schedules'] });
    if (!room) throw new NotFoundException('Operating room not found');
    return room;
  }

  async updateOperatingRoom(id: string, dto: UpdateOperatingRoomDto): Promise<OperatingRoom> {
    const room = await this.findOperatingRoomById(id);
    Object.assign(room, dto);
    return this.roomRepo.save(room);
  }

  async deleteOperatingRoom(id: string): Promise<void> {
    const room = await this.findOperatingRoomById(id);
    await this.roomRepo.remove(room);
  }

  // ========== Surgery Schedules ==========
  async createSchedule(dto: CreateSurgeryScheduleDto, clinicId: string): Promise<SurgerySchedule> {
    const [procedure, room] = await Promise.all([
      this.procedureRepo.findOne({ where: { id: dto.procedureId, clinicId } }),
      this.roomRepo.findOne({ where: { id: dto.operatingRoomId, clinicId } }),
    ]);

    if (!procedure) throw new BadRequestException('Procedure not found');
    if (!room) throw new BadRequestException('Operating room not found');

    // Check for scheduling conflicts
    const conflicts = await this.checkConflicts(
      dto.operatingRoomId,
      new Date(dto.scheduledStartTime),
      new Date(dto.scheduledEndTime || new Date(new Date(dto.scheduledStartTime).getTime() + procedure.estimatedDurationMinutes * 60000)),
    );
    if (conflicts.length > 0) {
      throw new BadRequestException('Operating room has conflicting surgeries at this time');
    }

    const scheduleCount = await this.scheduleRepo.count({ where: { clinicId } });
    const schedule = this.scheduleRepo.create({
      ...dto,
      scheduledStartTime: new Date(dto.scheduledStartTime),
      scheduledEndTime: dto.scheduledEndTime ? new Date(dto.scheduledEndTime) : new Date(new Date(dto.scheduledStartTime).getTime() + procedure.estimatedDurationMinutes * 60000),
      surgeryNumber: `SURG-${String(scheduleCount + 1).padStart(4, '0')}`,
      status: SurgeryStatus.SCHEDULED,
      clinicId,
    });
    return this.scheduleRepo.save(schedule);
  }

  async findSchedules(query: SurgeryScheduleQueryDto): Promise<SurgerySchedule[]> {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    if (query.surgeonId) where.primarySurgeonId = query.surgeonId;
    if (query.operatingRoomId) where.operatingRoomId = query.operatingRoomId;
    if (query.clinicId) where.clinicId = query.clinicId;

    if (query.startDate && query.endDate) {
      where.scheduledStartTime = Between(new Date(query.startDate), new Date(query.endDate));
    }

    return this.scheduleRepo.find({
      where,
      relations: ['procedure', 'operatingRoom', 'patient', 'primarySurgeon'],
      order: { scheduledStartTime: 'ASC' },
    });
  }

  async findScheduleById(id: string): Promise<SurgerySchedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['procedure', 'operatingRoom', 'patient', 'primarySurgeon'],
    });
    if (!schedule) throw new NotFoundException('Surgery schedule not found');
    return schedule;
  }

  async updateSchedule(id: string, dto: UpdateSurgeryScheduleDto): Promise<SurgerySchedule> {
    const schedule = await this.findScheduleById(id);
    Object.assign(schedule, dto);
    if (dto.scheduledStartTime) schedule.scheduledStartTime = new Date(dto.scheduledStartTime);
    if (dto.scheduledEndTime) schedule.scheduledEndTime = new Date(dto.scheduledEndTime);
    return this.scheduleRepo.save(schedule);
  }

  async deleteSchedule(id: string): Promise<void> {
    const schedule = await this.findScheduleById(id);
    await this.scheduleRepo.remove(schedule);
  }

  async checkConflicts(roomId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<SurgerySchedule[]> {
    const where: any = {
      operatingRoomId: roomId,
      status: In([SurgeryStatus.SCHEDULED, SurgeryStatus.CONFIRMED, SurgeryStatus.IN_PROGRESS]),
      scheduledStartTime: In([startTime, endTime]),
    };

    // More precise conflict check
    const schedules = await this.scheduleRepo.find({
      where: {
        operatingRoomId: roomId,
        status: In([SurgeryStatus.SCHEDULED, SurgeryStatus.CONFIRMED, SurgeryStatus.IN_PROGRESS]),
      },
    });

    return schedules.filter(s => {
      if (excludeId && s.id === excludeId) return false;
      const sStart = new Date(s.scheduledStartTime).getTime();
      const sEnd = new Date(s.scheduledEndTime).getTime();
      const newStart = startTime.getTime();
      const newEnd = endTime.getTime();
      return newStart < sEnd && newEnd > sStart; // Overlap check
    });
  }

  async getAvailableSlots(dto: AvailableSlotsDto): Promise<{ start: Date; end: Date }[]> {
    const duration = dto.durationMinutes || 30;
    const date = new Date(dto.date);
    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0);

    const existing = await this.scheduleRepo.find({
      where: {
        operatingRoomId: dto.operatingRoomId,
        status: In([SurgeryStatus.SCHEDULED, SurgeryStatus.CONFIRMED, SurgeryStatus.IN_PROGRESS]),
        scheduledStartTime: Between(dayStart, dayEnd),
      },
    });

    const slots: { start: Date; end: Date }[] = [];
    let current = dayStart;
    while (current.getTime() + duration * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      const hasConflict = existing.some(s => {
        const sStart = new Date(s.scheduledStartTime).getTime();
        const sEnd = new Date(s.scheduledEndTime).getTime();
        return current.getTime() < sEnd && slotEnd.getTime() > sStart;
      });
      if (!hasConflict) {
        slots.push({ start: new Date(current), end: slotEnd });
      }
      current = slotEnd;
    }
    return slots;
  }

  async getScheduleStats(clinicId: string): Promise<{ total: number; byStatus: Record<string, number>; upcoming: number }> {
    const schedules = await this.scheduleRepo.find({ where: { clinicId } });
    const byStatus: Record<string, number> = {};
    for (const s of schedules) {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    }
    const upcoming = schedules.filter(s =>
      s.status === SurgeryStatus.SCHEDULED || s.status === SurgeryStatus.CONFIRMED
    ).length;
    return { total: schedules.length, byStatus, upcoming };
  }
}