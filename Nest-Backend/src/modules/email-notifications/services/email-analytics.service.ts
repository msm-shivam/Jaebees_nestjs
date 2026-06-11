import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailNotification } from '../entities/email-notification.entity';
import { EmailLog } from '../entities/email-log.entity';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { NotificationStatus } from '../enums/notification-status.enum';

@Injectable()
export class EmailAnalyticsService {
  constructor(
    @InjectRepository(EmailNotification)
    private readonly notificationRepo: Repository<EmailNotification>,
    @InjectRepository(EmailLog)
    private readonly logRepo: Repository<EmailLog>,
    @InjectRepository(EmailCampaign)
    private readonly campaignRepo: Repository<EmailCampaign>,
  ) {}

  async getSummary() {
    const totalSent = await this.notificationRepo.count({ where: { status: NotificationStatus.SENT } });
    const totalFailed = await this.notificationRepo.count({ where: { status: NotificationStatus.FAILED } });
    const totalPending = await this.notificationRepo.count({ where: { status: NotificationStatus.PENDING } });
    const totalOpened = await this.notificationRepo.count({ where: { status: NotificationStatus.OPENED } });
    const totalClicked = await this.notificationRepo.count({ where: { status: NotificationStatus.CLICKED } });

    const totalNotifications = await this.notificationRepo.count();

    return {
      totalNotifications,
      totalSent,
      totalFailed,
      totalPending,
      totalOpened,
      totalClicked,
      deliveryRate: totalNotifications > 0 ? Math.round((totalSent / totalNotifications) * 100) : 0,
      openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
    };
  }

  async getEmailStats(query: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) {
    const qb = this.notificationRepo.createQueryBuilder('n')
      .leftJoinAndSelect('n.user', 'user')
      .orderBy('n.createdAt', 'DESC');

    if (query.dateFrom) qb.andWhere('n.created_at >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) qb.andWhere('n.created_at <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    return { data, total, page, limit };
  }

  async getCampaignStats() {
    const totalCampaigns = await this.campaignRepo.count();
    const sentCampaigns = await this.campaignRepo.count({ where: { status: 'SENT' } as any });
    const draftCampaigns = await this.campaignRepo.count({ where: { status: 'DRAFT' as any } });
    const scheduledCampaigns = await this.campaignRepo.count({ where: { status: 'SCHEDULED' as any } });

    const aggregate = await this.campaignRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.total_recipients), 0)', 'totalRecipients')
      .addSelect('COALESCE(SUM(c.successful_sends), 0)', 'successfulSends')
      .addSelect('COALESCE(SUM(c.failed_sends), 0)', 'failedSends')
      .addSelect('COALESCE(SUM(c.opens_count), 0)', 'opensCount')
      .addSelect('COALESCE(SUM(c.clicks_count), 0)', 'clicksCount')
      .getRawOne();

    return {
      totalCampaigns,
      sentCampaigns,
      draftCampaigns,
      scheduledCampaigns,
      ...aggregate,
    };
  }
}
