import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SavedReport } from '../entities/saved-report.entity';
import { CreateSavedReportDto } from '../dto/create-saved-report.dto';
import { UpdateSavedReportDto } from '../dto/update-saved-report.dto';
import { AdminUser } from '../../admin/entities/admin-user.entity';

@Injectable()
export class SavedReportService {
  constructor(
    @InjectRepository(SavedReport)
    private readonly savedReportRepo: Repository<SavedReport>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
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

    const adminIds = [
      ...new Set(data.map((d) => d.createdBy).filter(Boolean)),
    ] as string[];
    const admins =
      adminIds.length > 0
        ? await this.adminUserRepo.find({
            where: { id: In(adminIds) },
            select: { id: true, name: true },
          })
        : [];

    const adminMap = admins.reduce(
      (acc, admin) => {
        acc[admin.id] = admin.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    const mappedData = data.map((report) => ({
      id: report.id,
      name: report.name,
      reportType: report.reportType,
      filtersJson: report.filtersJson,
      createdAt: report.createdAt,
      createdBy: report.createdBy
        ? {
            id: report.createdBy,
            name: adminMap[report.createdBy] || 'Unknown Admin',
          }
        : null,
    }));

    return { data: mappedData, total, page, limit };
  }

  async findOne(id: string) {
    const report = await this.savedReportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Saved report not found');

    let createdByObj: { id: string; name: string } | null = null;
    if (report.createdBy) {
      const admin = await this.adminUserRepo.findOne({
        where: { id: report.createdBy },
        select: { id: true, name: true },
      });
      if (admin) {
        createdByObj = { id: admin.id, name: admin.name };
      }
    }

    return {
      id: report.id,
      name: report.name,
      reportType: report.reportType,
      filtersJson: report.filtersJson,
      createdAt: report.createdAt,
      createdBy: createdByObj,
    };
  }

  async update(id: string, dto: UpdateSavedReportDto) {
    const report = await this.savedReportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Saved report not found');
    Object.assign(report, dto);
    const updated = await this.savedReportRepo.save(report);
    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    const report = await this.savedReportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Saved report not found');
    await this.savedReportRepo.remove(report);
  }
}
