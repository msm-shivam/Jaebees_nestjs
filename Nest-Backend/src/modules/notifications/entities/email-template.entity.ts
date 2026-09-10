import { Entity, Column, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '../../../shared/entities/base.entity';

export enum EmailTemplateCode {
  WELCOME = 'welcome',
  WELCOME_DISCOUNT = 'welcome_discount',
  VERIFY_EMAIL = 'verify_email',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_RESET_CONFIRM = 'password_reset_confirm',
  EMAIL_VERIFIED = 'email_verified',
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_PLACED = 'order_placed',
  ORDER_STATUS_UPDATE = 'order_status_update',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_PROCESSING = 'payment_processing',
  REFUND_PROCESSED = 'refund_processed',
  SHIPMENT_CREATED = 'shipment_created',
  SHIPMENT_OUT_FOR_DELIVERY = 'shipment_out_for_delivery',
  ORDER_DELIVERED = 'order_delivered',
  SHIPMENT_STATUS_UPDATE = 'shipment_status_update',
  BILLING_INVOICE = 'billing_invoice',
  CART_ABANDONMENT = 'cart_abandonment',
  WISHLIST_BACK_IN_STOCK = 'wishlist_back_in_stock',
  WISHLIST_PROMOTION = 'wishlist_promotion',
  PRICE_DROP_ALERT = 'price_drop_alert',
  SALES_PROMOTION = 'sales_promotion',
  REVIEW_REMINDER = 'review_reminder',
  LOW_STOCK_ALERT = 'low_stock_alert',
  RETURN_REQUESTED = 'return_requested',
  RETURN_APPROVED = 'return_approved',
  RETURN_REJECTED = 'return_rejected',
  RETURN_REFUNDED = 'return_refunded',
  TICKET_CREATED = 'ticket_created',
  TICKET_REPLY = 'ticket_reply',
}

@Entity('email_templates')
@Index(['code'], { unique: true })
export class EmailTemplate extends BaseEntity {
  @Expose()
  @Column({ length: 100 })
  name: string;

  @Expose()
  @Column({ length: 100, unique: true })
  code: string;

  @Expose()
  @Column({ length: 255 })
  subject: string;

  @Expose()
  @Column({ type: 'text' })
  body: string;

  @Expose()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;
}
