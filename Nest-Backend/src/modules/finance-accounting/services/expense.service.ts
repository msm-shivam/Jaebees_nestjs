import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseRecord } from '../entities/expense-record.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(ExpenseRecord)
    private readonly expenseRepo: Repository<ExpenseRecord>,
  ) {}

  async create(
    dto: CreateExpenseDto,
    createdBy?: string,
  ): Promise<ExpenseRecord> {
    const expense = this.expenseRepo.create({
      ...dto,
      expenseDate: new Date(dto.expenseDate),
      createdBy: createdBy ?? null,
    });
    return this.expenseRepo.save(expense);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const qb = this.expenseRepo
      .createQueryBuilder('e')
      .orderBy('e.createdAt', 'DESC');

    if (query.category)
      qb.andWhere('e.category = :category', { category: query.category });
    if (query.dateFrom)
      qb.andWhere('e.expense_date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('e.expense_date <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ExpenseRecord> {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<ExpenseRecord> {
    const expense = await this.findOne(id);
    Object.assign(expense, {
      ...dto,
      expenseDate: dto.expenseDate
        ? new Date(dto.expenseDate)
        : expense.expenseDate,
    });
    return this.expenseRepo.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepo.remove(expense);
  }
}
