import { Injectable } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service';
import { TransactionalEmailType } from '../enums/transactional-email-type.enum';

@Injectable()
export class TransactionalEmailService {
  constructor(
    private readonly notificationService: EmailNotificationService,
  ) {}

  async sendOrderCreated(userId: string, orderNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.ORDER_CREATED, {
      orderNumber,
    });
  }

  async sendOrderConfirmed(userId: string, orderNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.ORDER_CONFIRMED, {
      orderNumber,
    });
  }

  async sendOrderShipped(userId: string, orderNumber: string, trackingNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.ORDER_SHIPPED, {
      orderNumber,
      trackingNumber,
    });
  }

  async sendOrderDelivered(userId: string, orderNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.ORDER_DELIVERED, {
      orderNumber,
    });
  }

  async sendOrderCancelled(userId: string, orderNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.ORDER_CANCELLED, {
      orderNumber,
    });
  }

  async sendPaymentSuccess(userId: string, orderNumber: string, amount: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.PAYMENT_SUCCESS, {
      orderNumber,
      amount,
    });
  }

  async sendPaymentFailed(userId: string, orderNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.PAYMENT_FAILED, {
      orderNumber,
    });
  }

  async sendReturnRequested(userId: string, returnNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.RETURN_REQUESTED, {
      returnNumber,
    });
  }

  async sendReturnApproved(userId: string, returnNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.RETURN_APPROVED, {
      returnNumber,
    });
  }

  async sendReturnRejected(userId: string, returnNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.RETURN_REJECTED, {
      returnNumber,
    });
  }

  async sendReturnRefunded(userId: string, returnNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.RETURN_REFUNDED, {
      returnNumber,
    });
  }

  async sendTicketCreated(userId: string, ticketNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.SUPPORT_TICKET_CREATED, {
      ticketNumber,
    });
  }

  async sendSupportReply(userId: string, ticketNumber: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.SUPPORT_REPLY, {
      ticketNumber,
    });
  }

  async sendPasswordReset(userId: string, resetLink: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.PASSWORD_RESET, {
      resetLink,
    });
  }

  async sendAccountCreated(userId: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.ACCOUNT_CREATED, {});
  }

  async sendWelcomeEmail(userId: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.WELCOME_EMAIL, {});
  }

  async sendCouponAssigned(userId: string, couponCode: string) {
    return this.notificationService.sendTransactional(userId, TransactionalEmailType.COUPON_ASSIGNED, {
      couponCode,
    });
  }
}
