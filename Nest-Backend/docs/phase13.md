## Layer 13 — Email Notifications & Communication Center

| Module                      | Status      | Started | Completed |
| --------------------------- | ----------- | ------- | --------- |
| Email Templates             | ⬜ Pending |
| Email Queue System          | ⬜ Pending |
| Customer Notifications      | ⬜ Pending |
| Admin Notifications         | ⬜ Pending |
| Transactional Emails        | ⬜ Pending |
| Marketing Emails            | ⬜ Pending |
| Notification Preferences    | ⬜ Pending |
| Notification Logs           | ⬜ Pending |

### Phase 13 Deliverables

- [ ] EmailTemplate Entity
- [ ] NotificationPreference Entity
- [ ] NotificationLog Entity
- [ ] Email Queue Processing
- [ ] Nodemailer Integration
- [ ] Template Engine (Handlebars)
- [ ] Welcome Email
- [ ] Email Verification Email
- [ ] Password Reset Email
- [ ] Order Confirmation Email
- [ ] Order Status Update Email
- [ ] Payment Success Email
- [ ] Payment Failed Email
- [ ] Refund Processed Email
- [ ] Shipment Created Email
- [ ] Delivery Completed Email
- [ ] Coupon Promotion Email
- [ ] Wishlist Back In Stock Email
- [ ] Review Reminder Email
- [ ] Customer Notification Preferences
- [ ] Admin Notification Center
- [ ] Queue Based Email Delivery
- [ ] Retry Failed Emails
- [ ] Email Tracking Logs
- [ ] Swagger Documentation
- [ ] RBAC Integration
- [ ] Migration Phase13EmailNotifications
- [ ] Seed Updates
- [ ] Zero TypeScript Build Errors

---

## Modules

### Email Templates

Manage reusable email templates.

Supported Templates:

- Welcome
- Verify Email
- Reset Password
- Order Confirmation
- Order Status Update
- Payment Success
- Payment Failed
- Refund Processed
- Shipment Created
- Delivery Completed
- Coupon Campaign
- Review Reminder

---

### Notification Preferences

Customer controls:

- Order Emails
- Payment Emails
- Shipment Emails
- Promotional Emails
- Review Reminder Emails

---

### Notification Logs

Track every email sent.

Fields:

- recipient
- subject
- template
- status
- errorMessage
- sentAt

---

## Database Tables

### email_templates

| Column |
|----------|
| id |
| name |
| code |
| subject |
| body |
| isActive |
| createdAt |
| updatedAt |

### notification_preferences

| Column |
|----------|
| id |
| userId |
| orderEmails |
| paymentEmails |
| shipmentEmails |
| promotionalEmails |
| reviewEmails |
| createdAt |
| updatedAt |

### notification_logs

| Column |
|----------|
| id |
| userId |
| recipient |
| template |
| subject |
| status |
| errorMessage |
| sentAt |
| createdAt |

---

## Permissions Added

| Permission | Slug |
|------------|------|
| View Notifications | notification.view |
| Manage Notifications | notification.manage |
| View Email Templates | email_template.view |
| Create Email Templates | email_template.create |
| Update Email Templates | email_template.update |
| Delete Email Templates | email_template.delete |

---

## API Endpoints

### Admin Email Templates

Base Path:

/api/v1/admin/email-templates

| Method | Endpoint |
|----------|----------|
| POST | / |
| GET | / |
| GET | /:id |
| PATCH | /:id |
| DELETE | /:id |

---

### Admin Notification Logs

Base Path:

/api/v1/admin/notifications

| Method | Endpoint |
|----------|----------|
| GET | /logs |
| GET | /logs/:id |
| POST | /send-test |

---

### Customer Notification Preferences

Base Path:

/api/v1/notifications/preferences

| Method | Endpoint |
|----------|----------|
| GET | / |
| PATCH | / |

---

## Business Rules

| Rule | Description |
|--------|------------|
| Welcome Email | Sent after successful registration |
| Verify Email | Sent during registration |
| Password Reset | Sent on forgot password |
| Order Confirmation | Sent after order placement |
| Payment Success | Sent after successful payment |
| Payment Failed | Sent after failed payment |
| Shipment Created | Sent when shipment generated |
| Delivery Completed | Sent when shipment delivered |
| Review Reminder | Sent 7 days after delivery |
| Promotional Emails | Respect user preferences |
| Queue Processing | All emails sent through queue |
| Retry Logic | Retry failed emails 3 times |
| Logging | Every email stored in logs |

---

## Technical Stack

### Packages

npm install nodemailer
npm install handlebars
npm install @nestjs/bull bull ioredis

### Queue

emails

Jobs:

- send-welcome-email
- verify-email
- password-reset
- order-confirmation
- payment-success
- payment-failed
- shipment-created
- delivery-completed
- review-reminder
- promotional-email

---

## Integration Points

### Auth Module

Triggers:

- Register
- Verify Email
- Forgot Password

### Orders Module

Triggers:

- Order Created
- Order Cancelled

### Payments Module

Triggers:

- Payment Success
- Payment Failed
- Refund Created

### Shipping Module

Triggers:

- Shipment Created
- Delivered

### Wishlist Module

Triggers:

- Back In Stock

### Reviews Module

Triggers:

- Review Reminder

---

## Migration

1749201300000-Phase13EmailNotifications.ts

Creates:

- email_templates
- notification_preferences
- notification_logs

Indexes:

- user_id
- recipient
- template
- status
- sent_at

---

## Layer 13 Out Of Scope

- SMS Notifications
- WhatsApp Notifications
- Push Notifications
- Mobile App Notifications
- In-App Notifications
- Firebase Messaging
- Multi-channel Campaign Automation