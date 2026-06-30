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
        `Failed to send ${options.templateCode} email to ${options.to}: ${(error as Error).message}`,
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

  async sendLowStockAlert(options: {
    to: string;
    sku: string;
    productName: string;
    currentQuantity: number;
    threshold: number;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      to: options.to,
      templateCode: EmailTemplateCode.LOW_STOCK_ALERT,
      context: {
        sku: options.sku,
        productName: options.productName,
        currentQuantity: options.currentQuantity,
        threshold: options.threshold,
      },
    });
  }

  async sendTestEmail(recipient: string, templateCode: string): Promise<void> {
    return this.sendTemplatedEmail({
      to: recipient,
      templateCode: templateCode as EmailTemplateCode,
      context: { firstName: 'Test User' },
    });
  }

  // ─── New convenience methods ──────────────────────────────────────────────

  async sendWelcomeDiscountEmail(
    to: string,
    firstName: string,
    discountCode: string,
    discountAmount: number,
  ): Promise<void> {
    return this.sendTemplatedEmail({
      to,
      templateCode: EmailTemplateCode.WELCOME_DISCOUNT,
      context: {
        firstName,
        discountCode,
        discountAmount,
        shopUrl: '{{shopUrl}}',
      },
    });
  }

  async sendOrderPlacedEmail(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    orderTotal: string;
    orderUrl: string;
    items: { name: string; quantity: number; price: string }[];
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.ORDER_PLACED,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        orderTotal: options.orderTotal,
        orderUrl: options.orderUrl,
        items: options.items,
      },
      preferenceType: 'order',
    });
  }

  async sendOrderStatusUpdate(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    oldStatus: string;
    newStatus: string;
    orderUrl: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.ORDER_STATUS_UPDATE,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        oldStatus: options.oldStatus,
        newStatus: options.newStatus,
        orderUrl: options.orderUrl,
      },
      preferenceType: 'order',
    });
  }

  async sendBillingInvoice(options: {
    to: string;
    userId: string;
    firstName: string;
    orderNumber: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: string;
    billingAddress: string;
    invoiceUrl: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.BILLING_INVOICE,
      context: {
        firstName: options.firstName,
        orderNumber: options.orderNumber,
        invoiceNumber: options.invoiceNumber,
        invoiceDate: options.invoiceDate,
        dueDate: options.dueDate,
        amount: options.amount,
        billingAddress: options.billingAddress,
        invoiceUrl: options.invoiceUrl,
      },
      preferenceType: 'payment',
    });
  }

  async sendCartAbandonmentEmail(options: {
    to: string;
    userId: string;
    firstName: string;
    cartTotal: string;
    discountCode: string;
    cartUrl: string;
    items: { name: string; quantity: number; price: string }[];
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.CART_ABANDONMENT,
      context: {
        firstName: options.firstName,
        cartTotal: options.cartTotal,
        discountCode: options.discountCode,
        cartUrl: options.cartUrl,
        items: options.items,
      },
      preferenceType: 'marketing',
    });
  }

  async sendWishlistPromotionEmail(options: {
    to: string;
    userId: string;
    firstName: string;
    discountCode: string;
    discountAmount: number;
    wishlistUrl: string;
    items: { name: string; originalPrice: string; salePrice: string }[];
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.WISHLIST_PROMOTION,
      context: {
        firstName: options.firstName,
        discountCode: options.discountCode,
        discountAmount: options.discountAmount,
        wishlistUrl: options.wishlistUrl,
        items: options.items,
      },
      preferenceType: 'marketing',
    });
  }

  async sendSalesPromotionEmail(options: {
    to: string;
    userId?: string;
    firstName: string;
    saleName: string;
    discountCode: string;
    discountAmount: number;
    validUntil: string;
    shopUrl: string;
  }): Promise<void> {
    return this.sendTemplatedEmail({
      userId: options.userId,
      to: options.to,
      templateCode: EmailTemplateCode.SALES_PROMOTION,
      context: {
        firstName: options.firstName,
        saleName: options.saleName,
        discountCode: options.discountCode,
        discountAmount: options.discountAmount,
        validUntil: options.validUntil,
        shopUrl: options.shopUrl,
      },
      preferenceType: 'marketing',
    });
  }
}
