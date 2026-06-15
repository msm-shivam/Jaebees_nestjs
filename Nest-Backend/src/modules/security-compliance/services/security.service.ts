import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityEvent } from '../entities/security-event.entity';
import { LoginActivity } from '../entities/login-activity.entity';
import { SecurityEventType } from '../enums/security-event-type.enum';
import { SeverityLevel } from '../enums/severity-level.enum';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(SecurityEvent)
    private readonly eventRepo: Repository<SecurityEvent>,
    @InjectRepository(LoginActivity)
    private readonly loginActivityRepo: Repository<LoginActivity>,
  ) {}

  async logEvent(params: {
    eventType: SecurityEventType;
    severity?: SeverityLevel;
    userId?: string | null;
    details?: Record<string, unknown> | null;
  }) {
    const event = this.eventRepo.create({
      eventType: params.eventType,
      severity: params.severity ?? SeverityLevel.LOW,
      userId: params.userId ?? null,
      details: params.details ?? null,
    });
    return this.eventRepo.save(event);
  }

  async logLoginAttempt(params: {
    email: string;
    status: string;
    userId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const activity = this.loginActivityRepo.create({
      email: params.email,
      status: params.status,
      userId: params.userId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
    return this.loginActivityRepo.save(activity);
  }

  async findEvents(query: {
    eventType?: string;
    severity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.eventRepo
      .createQueryBuilder('e')
      .orderBy('e.createdAt', 'DESC');

    if (query.eventType)
      qb.andWhere('e.event_type = :eventType', { eventType: query.eventType });
    if (query.severity)
      qb.andWhere('e.severity = :severity', { severity: query.severity });
    if (query.userId)
      qb.andWhere('e.user_id = :userId', { userId: query.userId });
    if (query.dateFrom)
      qb.andWhere('e.created_at >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('e.created_at <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findLoginActivities(query: {
    status?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.loginActivityRepo
      .createQueryBuilder('l')
      .orderBy('l.loginAt', 'DESC');

    if (query.status)
      qb.andWhere('l.status = :status', { status: query.status });
    if (query.userId)
      qb.andWhere('l.user_id = :userId', { userId: query.userId });
    if (query.dateFrom)
      qb.andWhere('l.login_at >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('l.login_at <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }
}
