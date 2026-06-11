import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EmailNotification } from '../entities/email-notification.entity';
import { EmailLog } from '../entities/email-log.entity';
import { EmailPreference } from '../entities/email-preference.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { TransactionalEmailType } from '../enums/transactional-email-type.enum';
import { EmailTemplate } from '../entities/email-template.entity';
import { User } from '../../users/entities/user.entity';
import { SendNotificationDto } from '../dto/send-notification.dto';

@Injectable()
export class EmailNotificationService {
  constructor(
    @InjectRepository(EmailNotification)
    private readonly notificationRepo: Repository<EmailNotification>,
    @InjectRepository(EmailLog)
    private readonly logRepo: Repository<EmailLog>,
    @InjectRepository(EmailPreference)
    private readonly preferenceRepo: Repository<EmailPreference>,
    @InjectRepository(EmailTemplate)
    private readonly templateRepo: Repository<EmailTemplate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async send(dto: SendNotificationDto): Promise<EmailNotification> {
    const notification = this.notificationRepo.create({
      userId: dto.userId ?? null,
      recipientEmail: dto.recipientEmail,
      subject: dto.subject,
      body: dto.body,
      type: dto.type ?? TransactionalEmailType.CUSTOM,
    });
    const saved = await this.notificationRepo.save(notification);

    try {
      await this.deliverEmail(saved);
      saved.status = NotificationStatus.SENT;
      saved.sentAt = new Date();
      await this.notificationRepo.save(saved);
      await this.logDelivery(saved, NotificationStatus.SENT);
    } catch (err) {
      saved.status = NotificationStatus.FAILED;
      await this.notificationRepo.save(saved);
      await this.logDelivery(saved, NotificationStatus.FAILED, err.message);
    }

    return saved;
  }

  async sendFromTemplate(code: string, recipientEmail: string, userId: string | null, variables: Record<string, string>): Promise<EmailNotification | null> {
    const template = await this.templateRepo.findOne({ where: { code, active: true } });
    if (!template) return null;

    const subject = this.replaceVariables(template.subjectTemplate, variables);
    const body = this.replaceVariables(template.bodyTemplate, variables);

    return this.send({
      userId: userId ?? undefined,
      recipientEmail,
      subject,
      body,
      type: code as TransactionalEmailType,
    });
  }

  async sendBulk(dtos: SendNotificationDto[]): Promise<EmailNotification[]> {
    const results: EmailNotification[] = [];
    for (const dto of dtos) {
      const result = await this.send(dto);
      results.push(result);
    }
    return results;
  }

  async sendTransactional(userId: string, type: TransactionalEmailType, variables: Record<string, string>): Promise<EmailNotification | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;

    const prefs = await this.preferenceRepo.findOne({ where: { userId } });
    if (!prefs || !prefs.transactionalEmailsEnabled) return null;

    const templateCode = type;
    return this.sendFromTemplate(templateCode, user.email, userId, variables);
  }

  async findAll(query: { page?: number; limit?: number; status?: NotificationStatus; userId?: string }) {
    const qb = this.notificationRepo.createQueryBuilder('n')
      .leftJoinAndSelect('n.user', 'user')
      .orderBy('n.createdAt', 'DESC');

    if (query.status) qb.andWhere('n.status = :status', { status: query.status });
    if (query.userId) qb.andWhere('n.user_id = :userId', { userId: query.userId });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<EmailNotification> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: { user: true, template: true },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async findMyNotifications(userId: string, query: { page?: number; limit?: number }) {
    const qb = this.notificationRepo.createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.createdAt', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, status: NotificationStatus.SENT, readAt: IsNull() },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.readAt = new Date();
    await this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { userId, readAt: IsNull() as any },
      { readAt: new Date() },
    );
  }

  async getPreferences(userId: string): Promise<EmailPreference> {
    let prefs = await this.preferenceRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.preferenceRepo.create({ userId });
      await this.preferenceRepo.save(prefs);
    }
    return prefs;
  }

  async updatePreferences(userId: string, updates: Partial<EmailPreference>): Promise<EmailPreference> {
    let prefs = await this.preferenceRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.preferenceRepo.create({ userId });
    }
    Object.assign(prefs, updates);
    await this.preferenceRepo.save(prefs);
    return prefs;
  }

  private async deliverEmail(notification: EmailNotification): Promise<void> {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';
    if (provider === 'log') {
      return;
    }
    await this.sendViaProvider(notification, provider);
  }

  private async sendViaProvider(notification: EmailNotification, provider: string): Promise<void> {
    return;
  }

  private async logDelivery(notification: EmailNotification, status: NotificationStatus, errorMessage?: string): Promise<void> {
    const log = this.logRepo.create({
      notificationId: notification.id,
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      status,
      errorMessage: errorMessage || null,
      deliveredAt: status === NotificationStatus.SENT ? new Date() : null,
    });
    await this.logRepo.save(log);
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }
}
