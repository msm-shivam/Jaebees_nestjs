import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(query: {
    action?: string;
    entityType?: string;
    userId?: string;
    severity?: string;
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
    if (query.severity)
      qb.andWhere('a.severity = :severity', { severity: query.severity });
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

    // Calculate metrics
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // Start of the week (assuming Sunday as start)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [todayLogs, thisWeekLogs, criticalEvents, totalLogs] =
      await Promise.all([
        this.auditLogRepo
          .createQueryBuilder('a')
          .where('a.created_at >= :startOfToday', { startOfToday })
          .getCount(),
        this.auditLogRepo
          .createQueryBuilder('a')
          .where('a.created_at >= :startOfWeek', { startOfWeek })
          .getCount(),
        this.auditLogRepo
          .createQueryBuilder('a')
          .where('a.severity = :severity', { severity: 'critical' })
          .getCount(),
        this.auditLogRepo.count(),
      ]);

    const userIds = [
      ...new Set(data.map((log) => log.userId).filter(Boolean)),
    ] as string[];
    let userMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const [admins, users] = await Promise.all([
        this.adminUserRepo.find({
          where: { id: In(userIds) },
          select: { id: true, name: true },
        }),
        this.userRepo.find({
          where: { id: In(userIds) },
          select: { id: true, firstName: true, lastName: true },
        }),
      ]);

      userMap = {
        ...admins.reduce(
          (acc, admin) => ({ ...acc, [admin.id]: admin.name }),
          {},
        ),
        ...users.reduce(
          (acc, user) => ({
            ...acc,
            [user.id]: `${user.firstName} ${user.lastName}`.trim(),
          }),
          {},
        ),
      };
    }
    

    const mappedData = data.map((log) => ({
      id: log.id,
      timestamp: log.createdAt,
      user: log.userId
        ? { id: log.userId, name: userMap[log.userId] || 'Unknown User' }
        : null,
      action: log.action,
      module: log.entityType,
      ipAddress: log.ipAddress,
      severity: log.severity,
      oldValues: log.oldValues,
      newValues: log.newValues,
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      metrics: {
        totalLogs,
        todayLogs,
        thisWeekLogs,
        criticalEvents,
      },
    };
  }

async findOne(id: string) {
  const log = await this.auditLogRepo.findOne({
    where: { id },
  });

  if (!log) {
    throw new NotFoundException('Audit log not found');
  }

  let user:any = null;

  if (log.userId) {
    const admin = await this.adminUserRepo.findOne({
      where: { id: log.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (admin) {
      user = admin;
    } else {
      const customer = await this.userRepo.findOne({
        where: { id: log.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (customer) {
        user = {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
        };
      }
    }
  }

  return {
    id: log.id,
    timestamp: log.createdAt,

    user,

    action: log.action,

    module: log.entityType,

    entityId: log.entityId,

    severity: log.severity,

    ipAddress: log.ipAddress,

    userAgent: log.userAgent,

    oldValues: log.oldValues,

    newValues: log.newValues,

    createdAt: log.createdAt,

    updatedAt: log.updatedAt,
  };
}

  async findByEntity(entityType: string, entityId: string) {
    return this.auditLogRepo.findOne({
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
