import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationLog,
  NotificationStatus,
} from './entities/notification-log.entity';
import { NotificationLogQueryDto } from './dto/notification-log-query.dto';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly logRepo: Repository<NotificationLog>,
  ) {}

  async create(data: {
    userId?: string;
    recipient: string;
    templateCode: string;
    subject: string;
    status?: NotificationStatus;
  }): Promise<NotificationLog> {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  async markSent(id: string): Promise<void> {
    await this.logRepo.update(id, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    });
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.logRepo.update(id, {
      status: NotificationStatus.FAILED,
      errorMessage,
    });
  }

  async findAll(query: NotificationLogQueryDto): Promise<{
    items: NotificationLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const [items, total] = await this.logRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: ((query.page || 1) - 1) * (query.limit || 20),
      take: query.limit || 20,
    });

    return { items, total, page: query.page || 1, limit: query.limit || 20 };
  }

  async findById(id: string): Promise<NotificationLog | null> {
    return this.logRepo.findOne({ where: { id } });
  }
}
