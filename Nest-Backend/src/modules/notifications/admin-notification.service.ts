import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThan, ILike } from 'typeorm';
import {
  AdminNotification,
  AdminNotificationType,
} from './entities/admin-notification.entity';
import { AdminNotificationQueryDto } from './dto/admin-notification-query.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AdminNotificationService {
  private readonly logger = new Logger(AdminNotificationService.name);

  constructor(
    @InjectRepository(AdminNotification)
    private readonly repo: Repository<AdminNotification>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(data: {
    type: AdminNotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<AdminNotification> {
    const notification = this.repo.create(data);
    const saved = await this.repo.save(notification);
    this.logger.log(`Admin notification created: ${saved.id} - ${saved.title}`);
    const pushData: Record<string, string> = { type: data.type, notificationId: saved.id };
    if (data.data) {
      for (const [key, value] of Object.entries(data.data)) {
        pushData[key] = String(value);
      }
    }
    try {
      await this.firebaseService.sendPushToAllAdmins({ title: data.title, body: data.message, data: pushData });
    } catch (err) {
      this.logger.error(`Push to admins failed: ${(err as Error).message}`);
    }
    return saved;
  }

  async findAll(query: AdminNotificationQueryDto): Promise<{
    items: AdminNotification[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const where: FindOptionsWhere<AdminNotification>[] = [];
    const baseWhere: FindOptionsWhere<AdminNotification> = {};

    if (query.type) {
      baseWhere.type = query.type;
    }
    if (query.isRead !== undefined) {
      baseWhere.isRead = query.isRead;
    }
    if (query.search) {
      where.push(
        { ...baseWhere, title: ILike(`%${query.search}%`) },
        { ...baseWhere, message: ILike(`%${query.search}%`) },
      );
    } else {
      where.push(baseWhere);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [items, total] = await this.repo.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AdminNotification> {
    const notification = await this.repo.findOne({ where: { id } as any });
    if (!notification) {
      throw new NotFoundException('Admin notification not found');
    }
    return notification;
  }

  async markAllAsRead(): Promise<{ count: number }> {
    const result = await this.repo.update(
      { isRead: false } as any,
      { isRead: true, readAt: new Date() },
    );
    return { count: result.affected ?? 0 };
  }

  async clearRead(): Promise<{ count: number }> {
    const result = await this.repo.delete({ isRead: true } as any);
    return { count: result.affected ?? 0 };
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.repo.remove(notification);
  }

  async cleanupOld(days: number = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = await this.repo.delete({
      createdAt: LessThan(cutoff) as any,
    } as any);
    return result.affected ?? 0;
  }

  async countUnread(): Promise<number> {
    return this.repo.count({ where: { isRead: false } as any });
  }

  async getSummary(): Promise<{
    total: number;
    unread: number;
    orders: number;
    inventory: number;
    customers: number;
    systemAlerts: number;
  }> {
    const [total, unread, orders, inventory, customers, systemAlerts] =
      await Promise.all([
        this.repo.count(),
        this.repo.count({ where: { isRead: false } as any }),
        this.repo.count({ where: { type: AdminNotificationType.ORDER } as any }),
        this.repo.count({ where: { type: AdminNotificationType.INVENTORY } as any }),
        this.repo.count({ where: { type: AdminNotificationType.CUSTOMER } as any }),
        this.repo.count({ where: { type: AdminNotificationType.SYSTEM_ALERT } as any }),
      ]);
    return { total, unread, orders, inventory, customers, systemAlerts };
  }
}
