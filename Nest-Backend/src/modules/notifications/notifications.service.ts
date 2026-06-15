import { Injectable, Logger } from '@nestjs/common';
import { EmailQueueService } from './email-queue.service';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { NotificationLogService } from './notification-log.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { EmailTemplateCode } from './entities/email-template.entity';
import { NotificationStatus } from './entities/notification-log.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly notificationLogService: NotificationLogService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  async sendTemplatedEmail(options: {
    userId?: string;
    to: string;
    templateCode: EmailTemplateCode;
    context: Record<string, any>;
    preferenceType?: string;
  }): Promise<void> {
    if (
      options.preferenceType &&
      options.userId &&
      !(await this.notificationPreferenceService.shouldSend(
        options.userId,
        options.preferenceType,
      ))
    ) {
      this.logger.log(
        `Skipping email to ${options.to} due to user preferences`,
      );
      return;
    }

    try {
      const template = await this.emailTemplateService.findByCode(
        options.templateCode,
      );
      const subject = this.emailService.renderTemplate(
        template.subject,
        options.context,
      );
      const html = this.emailService.renderTemplate(
        template.body,
        options.context,
      );

      const log = await this.notificationLogService.create({
        userId: options.userId,
        recipient: options.to,
        templateCode: options.templateCode,
        subject,
        status: NotificationStatus.QUEUED,
      });

      await this.emailQueueService.enqueue({
        to: options.to,
        subject,
        html,
        userId: options.userId,
        templateCode: options.templateCode,
      });

      await this.notificationLogService.markSent(log.id);
    } catch (error) {
      this.logger.error(
        `Failed to send ${options.templateCode} email to ${options.to}: ${error.message}`,
      );
    }
  }

  // ─── Convenience methods ────────────────────────────────────────────────────

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    return this.sendTemplatedEmail({
      to,
      templateCode: EmailTemplateCode.WELCOME,
      context: { firstName },
    });
  }

  async sendVerifyEmail(to: string, otp: string): Promise<void> {
    return this.sendTemplatedEmail({
      to,
      templateCode: EmailTemplateCode.VERIFY_EMAIL,
      context: { otp },
    });
  }

  async sendEmailVerified(to: string, firstName: string): Promise<void> {
    return this.sendTemplatedEmail({
      to,
      templateCode: EmailTemplateCode.EMAIL_VERIFIED,
      context: { firstName },
    });
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<void> {
    return this.sendTemplatedEmail({
      to,
      templateCode: EmailTemplateCode.PASSWORD_RESET,
      context: { otp },
    });
  }

  async sendPasswordResetConfirmation(
    to: string,
    firstName: string,
  ): Promise<void> {
    return this.sendTemplatedEmail({
      to,
      templateCode: EmailTemplateCode.PASSWORD_RESET_CONFIRM,
      context: { firstName },
    });
  }

  async sendOrderConfirmation(options: {
    to: string;
    userId: string;
    orderNumber: string;
    firstName: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.ORDER_CONFIRMATION,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
      },
      preferenceType: 'order',
    });
  }

  async sendPaymentSuccess(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    amount: number;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.PAYMENT_SUCCESS,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        amount: options.amount.toFixed(2),
      },
      preferenceType: 'payment',
    });
  }

  async sendPaymentFailed(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.PAYMENT_FAILED,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
      },
      preferenceType: 'payment',
    });
  }

  async sendRefundProcessed(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    amount: number;
    reason: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.REFUND_PROCESSED,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        amount: options.amount.toFixed(2),
        reason: options.reason,
      },
      preferenceType: 'payment',
    });
  }

  async sendShipmentCreated(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    trackingNumber: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.SHIPMENT_CREATED,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        trackingNumber: options.trackingNumber,
      },
      preferenceType: 'shipment',
    });
  }

  async sendOutForDelivery(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    trackingNumber: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.SHIPMENT_OUT_FOR_DELIVERY,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        trackingNumber: options.trackingNumber,
      },
      preferenceType: 'shipment',
    });
  }

  async sendDeliveryCompleted(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.ORDER_DELIVERED,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
      },
      preferenceType: 'shipment',
    });
  }

  async sendTestEmail(recipient: string, templateCode: string): Promise<void> {
    return this.sendTemplatedEmail({
      to: recipient,
      templateCode: templateCode as EmailTemplateCode,
      context: { firstName: 'Test User' },
    });
  }
}
