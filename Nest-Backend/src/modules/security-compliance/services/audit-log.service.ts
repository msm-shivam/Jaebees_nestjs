import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async findAll(query: {
    action?: string;
    entityType?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.auditLogRepo
      .createQueryBuilder('a')
      .orderBy('a.createdAt', 'DESC');

    if (query.action)
      qb.andWhere('a.action = :action', { action: query.action });
    if (query.entityType)
      qb.andWhere('a.entity_type = :entityType', {
        entityType: query.entityType,
      });
    if (query.userId)
      qb.andWhere('a.user_id = :userId', { userId: query.userId });
    if (query.dateFrom)
      qb.andWhere('a.created_at >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('a.created_at <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepo.findOne({ where: { id } });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.auditLogRepo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async log(params: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldValues?: Record<string, unknown> | null;
    newValues?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const log = this.auditLogRepo.create({
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
    return this.auditLogRepo.save(log);
  }
}
