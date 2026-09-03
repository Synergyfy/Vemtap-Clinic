import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffTask, TaskStatus, TaskPriority } from '../entities/staff-task.entity';

@Injectable()
export class StaffTasksService {
  constructor(@InjectRepository(StaffTask) private taskRepo: Repository<StaffTask>) {}

  async create(data: Partial<StaffTask>): Promise<StaffTask> {
    const task = this.taskRepo.create(data);
    return this.taskRepo.save(task);
  }

  async findAll(query: { clinicId?: string; assignedToId?: string; status?: string; priority?: string }): Promise<StaffTask[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    return this.taskRepo.find({ where, relations: ['assignedTo', 'assignedBy', 'patient'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<StaffTask> {
    const task = await this.taskRepo.findOne({ where: { id }, relations: ['assignedTo', 'assignedBy', 'patient'] });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<StaffTask> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    task.status = status;
    return this.taskRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    await this.taskRepo.delete(id);
  }
}
