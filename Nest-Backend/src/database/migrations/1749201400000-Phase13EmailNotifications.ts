import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class Phase13EmailNotifications1749201400000
  implements MigrationInterface
{
  name = 'Phase13EmailNotifications1749201400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── email_templates ─────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'email_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'code', type: 'varchar', length: '100' },
          { name: 'subject', type: 'varchar', length: '255' },
          { name: 'body', type: 'text' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'email_templates',
      new TableIndex({
        name: 'idx_email_templates_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // ── notification_preferences ─────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'notification_preferences',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'order_emails', type: 'boolean', default: true },
          { name: 'payment_emails', type: 'boolean', default: true },
          { name: 'shipment_emails', type: 'boolean', default: true },
          { name: 'promotional_emails', type: 'boolean', default: false },
          { name: 'review_emails', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'notification_preferences',
      new TableIndex({
        name: 'idx_notification_preferences_user',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'notification_preferences',
      new TableForeignKey({
        name: 'fk_notification_preferences_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ── notification_logs ─────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'notification_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'recipient', type: 'varchar', length: '255' },
          { name: 'template_code', type: 'varchar', length: '100' },
          { name: 'subject', type: 'varchar', length: '255' },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: `'queued'`,
          },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'sent_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'notification_logs',
      new TableIndex({
        name: 'idx_notification_logs_user',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'notification_logs',
      new TableIndex({
        name: 'idx_notification_logs_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'notification_logs',
      new TableIndex({
        name: 'idx_notification_logs_sent_at',
        columnNames: ['sent_at'],
      }),
    );

    // ── Seed default email templates ──────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO email_templates (name, code, subject, body, is_active, description) VALUES
      ('Welcome Email', 'welcome', 'Welcome to Sports Store, {{firstName}}!',
        '<!DOCTYPE html><html><body><h1>Welcome {{firstName}}!</h1><p>Thank you for joining Sports Store. We are excited to have you on board.</p><p>Start exploring our collection of premium sports gear and equipment.</p></body></html>',
        true, 'Sent when a new user registers'),
      ('Verify Email', 'verify_email', 'Verify Your Email Address',
        '<!DOCTYPE html><html><body><h1>Email Verification</h1><p>Your verification code is: <strong>{{otp}}</strong></p><p>This code will expire in 10 minutes.</p></body></html>',
        true, 'Sent with OTP for email verification'),
      ('Password Reset', 'password_reset', 'Reset Your Password',
        '<!DOCTYPE html><html><body><h1>Password Reset</h1><p>Your password reset code is: <strong>{{otp}}</strong></p><p>This code will expire in 10 minutes.</p></body></html>',
        true, 'Sent with OTP for password reset'),
      ('Password Reset Confirmation', 'password_reset_confirm', 'Your Password Has Been Reset',
        '<!DOCTYPE html><html><body><h1>Password Reset Successful</h1><p>Hi {{firstName}},</p><p>Your password has been successfully reset.</p><p>If you did not make this change, please contact support immediately.</p></body></html>',
        true, 'Sent after successful password reset'),
      ('Email Verified', 'email_verified', 'Email Verified Successfully',
        '<!DOCTYPE html><html><body><h1>Email Verified</h1><p>Hi {{firstName}},</p><p>Your email address has been verified successfully.</p></body></html>',
        true, 'Sent after email verification'),
      ('Order Confirmation', 'order_confirmation', 'Order #{{orderNumber}} Confirmed',
        '<!DOCTYPE html><html><body><h1>Order Confirmed!</h1><p>Hi {{firstName}},</p><p>Your order <strong>#{{orderNumber}}</strong> has been placed successfully.</p><p>We will notify you once it ships.</p></body></html>',
        true, 'Sent when order is placed'),
      ('Payment Success', 'payment_success', 'Payment Received for Order #{{orderNumber}}',
        '<!DOCTYPE html><html><body><h1>Payment Received</h1><p>Hi {{firstName}},</p><p>Your payment of <strong>\${{amount}}</strong> for order <strong>#{{orderNumber}}</strong> has been received.</p></body></html>',
        true, 'Sent on successful payment'),
      ('Payment Failed', 'payment_failed', 'Payment Failed for Order #{{orderNumber}}',
        '<!DOCTYPE html><html><body><h1>Payment Failed</h1><p>Hi {{firstName}},</p><p>The payment for order <strong>#{{orderNumber}}</strong> has failed.</p><p>Please try again with a different payment method.</p></body></html>',
        true, 'Sent on payment failure'),
      ('Payment Processing', 'payment_processing', 'Payment Processing for Order #{{orderNumber}}',
        '<!DOCTYPE html><html><body><h1>Payment Processing</h1><p>Hi {{firstName}},</p><p>Your payment for order <strong>#{{orderNumber}}</strong> is being processed.</p></body></html>',
        true, 'Sent when payment is processing'),
      ('Refund Processed', 'refund_processed', 'Refund Processed for Order #{{orderNumber}}',
        '<!DOCTYPE html><html><body><h1>Refund Processed</h1><p>Hi {{firstName}},</p><p>A refund of <strong>\${{amount}}</strong> for order <strong>#{{orderNumber}}</strong> has been processed.</p><p>Reason: {{reason}}</p></body></html>',
        true, 'Sent when refund is processed'),
      ('Shipment Created', 'shipment_created', 'Order #{{orderNumber}} Is Being Prepared',
        '<!DOCTYPE html><html><body><h1>Order In Progress</h1><p>Hi {{firstName}},</p><p>Your order <strong>#{{orderNumber}}</strong> is being prepared for shipment.</p><p>Tracking: {{trackingNumber}}</p></body></html>',
        true, 'Sent when shipment is created'),
      ('Out for Delivery', 'shipment_out_for_delivery', 'Your Order #{{orderNumber}} Is Out for Delivery',
        '<!DOCTYPE html><html><body><h1>Out for Delivery!</h1><p>Hi {{firstName}},</p><p>Your order <strong>#{{orderNumber}}</strong> is out for delivery.</p><p>Tracking: {{trackingNumber}}</p></body></html>',
        true, 'Sent when shipment is out for delivery'),
      ('Order Delivered', 'order_delivered', 'Order #{{orderNumber}} Delivered',
        '<!DOCTYPE html><html><body><h1>Order Delivered</h1><p>Hi {{firstName}},</p><p>Your order <strong>#{{orderNumber}}</strong> has been delivered successfully.</p><p>We hope you love your purchase!</p></body></html>',
        true, 'Sent when order is delivered'),
      ('Shipment Status Update', 'shipment_status_update', 'Shipment Update for Order #{{orderNumber}}',
        '<!DOCTYPE html><html><body><h1>Shipment Update</h1><p>Hi {{firstName}},</p><p>Your order <strong>#{{orderNumber}}</strong> status has been updated to: {{status}}.</p></body></html>',
        true, 'Sent on shipment status change'),
      ('Back in Stock', 'wishlist_back_in_stock', 'Item Back in Stock',
        '<!DOCTYPE html><html><body><h1>Back in Stock!</h1><p>Hi {{firstName}},</p><p>An item on your wishlist is back in stock: <strong>{{productName}}</strong>.</p><p>Check it out before it sells out again!</p></body></html>',
        true, 'Sent when wishlist item is back in stock'),
      ('Price Drop Alert', 'price_drop_alert', 'Price Dropped on Your Wishlist Item',
        '<!DOCTYPE html><html><body><h1>Price Drop!</h1><p>Hi {{firstName}},</p><p>The price has dropped on: <strong>{{productName}}</strong>.</p><p>Now just <strong>\${{newPrice}}</strong> (was \${{oldPrice}}).</p></body></html>',
        true, 'Sent when wishlist item price drops'),
      ('Review Reminder', 'review_reminder', 'How Was Your Purchase?',
        '<!DOCTYPE html><html><body><h1>We Value Your Feedback</h1><p>Hi {{firstName}},</p><p>Your order <strong>#{{orderNumber}}</strong> was delivered recently. We would love to hear your thoughts!</p><p><a href="{{reviewLink}}">Write a Review</a></p></body></html>',
        true, 'Sent as reminder to review purchased items'),
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "email_templates"`);
  }
}
