import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotification } from './entities/email-notification.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailPreference } from './entities/email-preference.entity';
import { EmailLog } from './entities/email-log.entity';
import { EmailCampaign } from './entities/email-campaign.entity';
import { User } from '../users/entities/user.entity';
import { EmailNotificationService } from './services/email-notification.service';
import { TransactionalEmailService } from './services/transactional-email.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailCampaignService } from './services/email-campaign.service';
import { EmailAnalyticsService } from './services/email-analytics.service';
import { CustomerNotificationController } from './controllers/customer-notification.controller';
import { AdminNotificationController } from './controllers/admin-notification.controller';
import { AdminEmailTemplateController } from './controllers/admin-email-template.controller';
import { AdminEmailCampaignController } from './controllers/admin-email-campaign.controller';
import { AdminCommunicationAnalyticsController } from './controllers/admin-communication-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailNotification,
      EmailTemplate,
      EmailPreference,
      EmailLog,
      EmailCampaign,
      User,
    ]),
  ],
  controllers: [
    CustomerNotificationController,
    AdminNotificationController,
    AdminEmailTemplateController,
    AdminEmailCampaignController,
    AdminCommunicationAnalyticsController,
  ],
  providers: [
    EmailNotificationService,
    TransactionalEmailService,
    EmailTemplateService,
    EmailCampaignService,
    EmailAnalyticsService,
  ],
  exports: [
    EmailNotificationService,
    TransactionalEmailService,
  ],
})
export class EmailNotificationsModule {}
