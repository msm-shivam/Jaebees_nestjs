import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { redisConfig } from '../../config/redis.config';
import { EmailTemplate } from './entities/email-template.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { EmailService } from './email.service';
import { EmailQueueService, EMAIL_QUEUE } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { EmailTemplateService } from './email-template.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationLogService } from './notification-log.service';
import { NotificationsService } from './notifications.service';
import { AdminEmailTemplatesController } from './controllers/admin-email-templates.controller';
import { AdminNotificationsController } from './controllers/admin-notifications.controller';
import { CustomerNotificationsController } from './controllers/customer-notifications.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailTemplate,
      NotificationPreference,
      NotificationLog,
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [redisConfig.KEY],
      useFactory: (redis: ConfigType<typeof redisConfig>) => ({
        redis: { host: redis.host, port: redis.port },
      }),
    }),
    BullModule.registerQueue({ name: EMAIL_QUEUE }),
  ],
  controllers: [
    AdminEmailTemplatesController,
    AdminNotificationsController,
    CustomerNotificationsController,
  ],
  providers: [
    EmailService,
    EmailQueueService,
    EmailProcessor,
    EmailTemplateService,
    NotificationPreferenceService,
    NotificationLogService,
    NotificationsService,
  ],
  exports: [
    NotificationsService,
    EmailQueueService,
    NotificationPreferenceService,
  ],
})
export class NotificationsModule {}
