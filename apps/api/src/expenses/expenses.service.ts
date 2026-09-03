import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto } from './dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  async findAll(query: ExpenseQueryDto): Promise<Expense[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.startDate && query.endDate) {
      where.date = Between(new Date(query.startDate), new Date(query.endDate));
    }
    return this.repo.find({ where, order: { date: 'DESC' } });
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.repo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const expense = this.repo.create({ ...dto, date: new Date(dto.date) });
    return this.repo.save(expense);
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, dto);
    return this.repo.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.repo.remove(expense);
  }

  async getSummary(clinicId: string): Promise<{ total: number; byCategory: Record<string, number>; byStatus: Record<string, number> }> {
    const expenses = await this.repo.find({ where: { clinicId } });
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
      byStatus[e.status] = (byStatus[e.status] || 0) + Number(e.amount);
    }
    return { total, byCategory, byStatus };
  }
}
