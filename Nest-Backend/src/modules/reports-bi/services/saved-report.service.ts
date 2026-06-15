import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedReport } from '../entities/saved-report.entity';
import { CreateSavedReportDto } from '../dto/create-saved-report.dto';
import { UpdateSavedReportDto } from '../dto/update-saved-report.dto';

@Injectable()
export class SavedReportService {
  constructor(
    @InjectRepository(SavedReport)
    private readonly savedReportRepo: Repository<SavedReport>,
  ) {}

  async create(
    dto: CreateSavedReportDto,
    createdBy?: string,
  ): Promise<SavedReport> {
    const report = this.savedReportRepo.create({
      ...dto,
      createdBy: createdBy ?? null,
    });
    return this.savedReportRepo.save(report);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.savedReportRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<SavedReport> {
    const report = await this.savedReportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Saved report not found');
    return report;
  }

  async update(id: string, dto: UpdateSavedReportDto): Promise<SavedReport> {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    return this.savedReportRepo.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.savedReportRepo.remove(report);
  }
}
