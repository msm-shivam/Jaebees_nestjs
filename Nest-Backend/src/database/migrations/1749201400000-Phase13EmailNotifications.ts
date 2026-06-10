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

    // ── Seed minimal email templates (body managed via admin) ──────────────────
    await queryRunner.query(`
      INSERT INTO email_templates (name, code, subject, body, is_active, description) VALUES
      ('Welcome Email', 'welcome', 'Welcome to Sports Store!', '', true, 'Sent when a new user registers'),
      ('Verify Email', 'verify_email', 'Verify Your Email Address', '', true, 'Sent with OTP for email verification'),
      ('Password Reset', 'password_reset', 'Reset Your Password', '', true, 'Sent with OTP for password reset'),
      ('Password Reset Confirmation', 'password_reset_confirm', 'Your Password Has Been Reset', '', true, 'Sent after successful password reset'),
      ('Email Verified', 'email_verified', 'Email Verified Successfully', '', true, 'Sent after email verification'),
      ('Order Confirmation', 'order_confirmation', 'Order Confirmed', '', true, 'Sent when order is placed'),
      ('Payment Success', 'payment_success', 'Payment Received', '', true, 'Sent on successful payment'),
      ('Payment Failed', 'payment_failed', 'Payment Failed', '', true, 'Sent on payment failure'),
      ('Shipment Created', 'shipment_created', 'Shipment Created', '', true, 'Sent when shipment is created'),
      ('Out for Delivery', 'shipment_out_for_delivery', 'Out for Delivery', '', true, 'Sent when shipment is out for delivery'),
      ('Order Delivered', 'order_delivered', 'Order Delivered', '', true, 'Sent when order is delivered'),
      ('Refund Processed', 'refund_processed', 'Refund Processed', '', true, 'Sent when refund is processed'),
      ('Back in Stock', 'wishlist_back_in_stock', 'Back in Stock!', '', true, 'Sent when wishlist item is back in stock'),
      ('Price Drop Alert', 'price_drop_alert', 'Price Dropped!', '', true, 'Sent when wishlist item price drops'),
      ('Review Reminder', 'review_reminder', 'How Was Your Purchase?', '', true, 'Sent as reminder to review purchased items')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "email_templates"`);
  }
}
