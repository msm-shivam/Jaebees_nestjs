import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { v4 as uuid } from 'uuid';
import { Table, TableIndex } from 'typeorm';

dotenv.config();

function htmlWrap(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a73e8;padding:30px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">Sport Ecommerce</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8f8;padding:20px 40px;text-align:center;font-size:12px;color:#888888;">
              <p style="margin:0 0 8px;">&copy; 2026 Sport Ecommerce. All rights reserved.</p>
              <p style="margin:0;">123 Sports Avenue, Athlete City, SP 10001</p>
              <p style="margin:8px 0 0;">
                <a href="#" style="color:#1a73e8;text-decoration:none;">Unsubscribe</a> |
                <a href="#" style="color:#1a73e8;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const templates: {
  name: string;
  code: string;
  subject: string;
  body: string;
  description: string;
}[] = [
  // ── Welcome ──
  {
    name: 'Welcome Email',
    code: 'welcome',
    subject: 'Welcome to Sport Ecommerce, {{firstName}}!',
    body: htmlWrap(
      'Welcome',
      `
      <h2 style="color:#333;margin:0 0 16px;">Welcome, {{firstName}}! 👋</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Thank you for joining Sport Ecommerce! We are thrilled to have you on board.
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Explore our wide range of sports equipment, apparel, and accessories designed to help you perform at your best.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="{{shopUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Start Shopping</a>
      </div>
      <p style="color:#555;line-height:1.6;margin:0;">If you have any questions, feel free to reply to this email.</p>
    `,
    ),
    description: 'Sent when a new user registers',
  },
  {
    name: 'Welcome Email with Discount',
    code: 'welcome_discount',
    subject:
      'Welcome to Sport Ecommerce – Get {{discountAmount}}% Off Your First Order!',
    body: htmlWrap(
      'Welcome Discount',
      `
      <h2 style="color:#333;margin:0 0 16px;">Welcome, {{firstName}}! 🎉</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        We are excited to have you as part of the Sport Ecommerce family. As a special welcome gift, here is an exclusive discount for your first order!
      </p>
      <div style="background-color:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:14px;color:#856404;margin:0 0 8px;">YOUR DISCOUNT CODE</p>
        <p style="font-size:28px;font-weight:bold;color:#333;margin:0 0 8px;letter-spacing:4px;">{{discountCode}}</p>
        <p style="font-size:16px;color:#856404;margin:0;">Get {{discountAmount}}% OFF on your first order!</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{shopUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Shop Now</a>
      </div>
      <p style="color:#888;font-size:13px;margin:0;">*Terms and conditions apply. Valid for first-time customers only.</p>
    `,
    ),
    description: 'Welcome email with a discount code for new users',
  },

  // ── Verification ──
  {
    name: 'Verify Email',
    code: 'verify_email',
    subject: 'Verify your email address',
    body: htmlWrap(
      'Verify Email',
      `
      <h2 style="color:#333;margin:0 0 16px;">Verify Your Email</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Thank you for signing up! Please use the OTP below to verify your email address.
      </p>
      <div style="background-color:#f0f0f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:32px;font-weight:bold;color:#333;margin:0;letter-spacing:8px;">{{otp}}</p>
      </div>
      <p style="color:#888;font-size:13px;margin:0;">This OTP will expire in 10 minutes.</p>
    `,
    ),
    description: 'Sent when user needs to verify email address',
  },
  {
    name: 'Email Verified',
    code: 'email_verified',
    subject: 'Your email has been verified, {{firstName}}!',
    body: htmlWrap(
      'Email Verified',
      `
      <h2 style="color:#333;margin:0 0 16px;">Email Verified ✅</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Hi {{firstName}}, your email address has been successfully verified. Your account is now fully active!
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{shopUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Continue Shopping</a>
      </div>
    `,
    ),
    description: 'Sent after email is successfully verified',
  },

  // ── Password ──
  {
    name: 'Password Reset',
    code: 'password_reset',
    subject: 'Reset your password',
    body: htmlWrap(
      'Password Reset',
      `
      <h2 style="color:#333;margin:0 0 16px;">Reset Your Password</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        We received a request to reset your password. Use the OTP below to proceed.
      </p>
      <div style="background-color:#f0f0f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:32px;font-weight:bold;color:#333;margin:0;letter-spacing:8px;">{{otp}}</p>
      </div>
      <p style="color:#888;font-size:13px;margin:0 0 20px;">This OTP will expire in 10 minutes.</p>
      <p style="color:#888;font-size:13px;margin:0;">If you did not request this, please ignore this email.</p>
    `,
    ),
    description: 'Sent when user requests a password reset',
  },
  {
    name: 'Password Reset Confirmation',
    code: 'password_reset_confirm',
    subject: 'Your password has been changed, {{firstName}}',
    body: htmlWrap(
      'Password Changed',
      `
      <h2 style="color:#333;margin:0 0 16px;">Password Changed Successfully 🔒</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Hi {{firstName}}, your password has been changed successfully.
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        If you did not make this change, please contact our support team immediately.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{loginUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Log In</a>
      </div>
    `,
    ),
    description: 'Sent after password is successfully reset',
  },

  // ── Order ──
  {
    name: 'Order Confirmation',
    code: 'order_confirmation',
    subject: 'Order {{orderNumber}} Confirmed – Thank You!',
    body: htmlWrap(
      'Order Confirmation',
      `
      <h2 style="color:#333;margin:0 0 16px;">Order Confirmed! 🎉</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your order <strong>#{{orderNumber}}</strong> has been confirmed and is being processed.
      </p>
      <table style="width:100%;margin:20px 0;">
        <tr>
          <td style="padding:12px;background-color:#f8f8f8;"><strong>Order Number</strong></td>
          <td style="padding:12px;background-color:#f8f8f8;">#{{orderNumber}}</td>
        </tr>
        <tr>
          <td style="padding:12px;"><strong>Order Date</strong></td>
          <td style="padding:12px;">{{orderDate}}</td>
        </tr>
        <tr>
          <td style="padding:12px;background-color:#f8f8f8;"><strong>Total</strong></td>
          <td style="padding:12px;background-color:#f8f8f8;">\${{orderTotal}}</td>
        </tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{orderUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">View Order</a>
      </div>
    `,
    ),
    description: 'Sent when an order is confirmed',
  },
  {
    name: 'Order Placed',
    code: 'order_placed',
    subject: 'Order #{{orderNumber}} Placed Successfully',
    body: htmlWrap(
      'Order Placed',
      `
      <h2 style="color:#333;margin:0 0 16px;">Order Placed! 🛒</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your order <strong>#{{orderNumber}}</strong> has been placed successfully. Here is a summary of your purchase:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background-color:#1a73e8;color:#ffffff;">
            <th style="padding:12px;text-align:left;">Item</th>
            <th style="padding:12px;text-align:center;">Qty</th>
            <th style="padding:12px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:12px;">{{this.name}}</td>
            <td style="padding:12px;text-align:center;">{{this.quantity}}</td>
            <td style="padding:12px;text-align:right;">\${{this.price}}</td>
          </tr>
          {{/each}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:bold;">Total:</td>
            <td style="padding:12px;text-align:right;font-weight:bold;">\${{orderTotal}}</td>
          </tr>
        </tfoot>
      </table>
      <p style="color:#555;line-height:1.6;margin:20px 0;">
        You will receive a shipping confirmation once your order is dispatched.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{orderUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Track Order</a>
      </div>
    `,
    ),
    description: 'Sent immediately after an order is placed with item details',
  },
  {
    name: 'Order Status Update',
    code: 'order_status_update',
    subject: 'Order #{{orderNumber}} Status Updated to {{newStatus}}',
    body: htmlWrap(
      'Order Status Update',
      `
      <h2 style="color:#333;margin:0 0 16px;">Order Status Update 🔄</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        The status of your order <strong>#{{orderNumber}}</strong> has been updated.
      </p>
      <table style="width:100%;margin:20px 0;">
        <tr>
          <td style="padding:12px;background-color:#f8f8f8;"><strong>Previous Status</strong></td>
          <td style="padding:12px;background-color:#f8f8f8;">{{oldStatus}}</td>
        </tr>
        <tr>
          <td style="padding:12px;"><strong>New Status</strong></td>
          <td style="padding:12px;color:#1a73e8;font-weight:bold;">{{newStatus}}</td>
        </tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{orderUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">View Order</a>
      </div>
    `,
    ),
    description: 'Sent when the status of an existing order changes',
  },

  // ── Payment / Billing ──
  {
    name: 'Payment Success',
    code: 'payment_success',
    subject: 'Payment Successful for Order #{{orderNumber}}',
    body: htmlWrap(
      'Payment Success',
      `
      <h2 style="color:#333;margin:0 0 16px;">Payment Successful ✅</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your payment of <strong>\${{amount}}</strong> for order <strong>#{{orderNumber}}</strong> has been processed successfully.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{orderUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">View Order</a>
      </div>
    `,
    ),
    description: 'Sent when payment is successful',
  },
  {
    name: 'Payment Failed',
    code: 'payment_failed',
    subject: 'Payment Failed for Order #{{orderNumber}}',
    body: htmlWrap(
      'Payment Failed',
      `
      <h2 style="color:#333;margin:0 0 16px;">Payment Failed ❌</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Unfortunately, the payment for order <strong>#{{orderNumber}}</strong> has failed.
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Please check your payment details and try again.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{retryUrl}}" style="background-color:#dc3545;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Retry Payment</a>
      </div>
    `,
    ),
    description: 'Sent when payment fails',
  },
  {
    name: 'Payment Processing',
    code: 'payment_processing',
    subject: 'Payment is being processed for Order #{{orderNumber}}',
    body: htmlWrap(
      'Payment Processing',
      `
      <h2 style="color:#333;margin:0 0 16px;">Payment Processing ⏳</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your payment for order <strong>#{{orderNumber}}</strong> is currently being processed. This usually takes a few moments.
      </p>
      <p style="color:#555;line-height:1.6;margin:0;">We will notify you once the payment is confirmed.</p>
    `,
    ),
    description: 'Sent when payment is processing',
  },
  {
    name: 'Refund Processed',
    code: 'refund_processed',
    subject: 'Refund Processed for Order #{{orderNumber}}',
    body: htmlWrap(
      'Refund Processed',
      `
      <h2 style="color:#333;margin:0 0 16px;">Refund Processed 💰</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        A refund of <strong>\${{amount}}</strong> has been processed for order <strong>#{{orderNumber}}</strong>.
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;"><strong>Reason:</strong> {{reason}}</p>
      <p style="color:#888;font-size:13px;margin:20px 0 0;">
        The refund will appear in your account within 5-10 business days depending on your payment provider.
      </p>
    `,
    ),
    description: 'Sent when a refund is processed',
  },
  {
    name: 'Billing Invoice',
    code: 'billing_invoice',
    subject: 'Invoice #{{invoiceNumber}} for Order #{{orderNumber}}',
    body: htmlWrap(
      'Billing Invoice',
      `
      <h2 style="color:#333;margin:0 0 16px;">Invoice #{{invoiceNumber}} 📄</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Please find your invoice for order <strong>#{{orderNumber}}</strong> below.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr>
          <td style="padding:8px 12px;background-color:#f8f8f8;"><strong>Invoice Number</strong></td>
          <td style="padding:8px 12px;background-color:#f8f8f8;">{{invoiceNumber}}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;"><strong>Order Number</strong></td>
          <td style="padding:8px 12px;">#{{orderNumber}}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background-color:#f8f8f8;"><strong>Invoice Date</strong></td>
          <td style="padding:8px 12px;background-color:#f8f8f8;">{{invoiceDate}}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;"><strong>Due Date</strong></td>
          <td style="padding:8px 12px;">{{dueDate}}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background-color:#f8f8f8;"><strong>Total Amount</strong></td>
          <td style="padding:8px 12px;background-color:#f8f8f8;font-weight:bold;">\${{amount}}</td>
        </tr>
      </table>
      <h3 style="color:#333;margin:24px 0 12px;">Billing Address</h3>
      <p style="color:#555;line-height:1.6;margin:0;">{{billingAddress}}</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{invoiceUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Download Invoice</a>
      </div>
    `,
    ),
    description: 'Sent to customer with billing invoice',
  },

  // ── Shipment ──
  {
    name: 'Shipment Created',
    code: 'shipment_created',
    subject: 'Your Order #{{orderNumber}} Has Been Shipped!',
    body: htmlWrap(
      'Shipment Created',
      `
      <h2 style="color:#333;margin:0 0 16px;">Your Order Has Been Shipped! 🚚</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your order <strong>#{{orderNumber}}</strong> has been shipped and is on its way!
      </p>
      <div style="background-color:#f0f0f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:14px;color:#555;margin:0 0 8px;">Tracking Number</p>
        <p style="font-size:20px;font-weight:bold;color:#333;margin:0;letter-spacing:2px;">{{trackingNumber}}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{trackingUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Track Shipment</a>
      </div>
    `,
    ),
    description: 'Sent when a shipment is created for an order',
  },
  {
    name: 'Shipment Out for Delivery',
    code: 'shipment_out_for_delivery',
    subject: 'Your Order #{{orderNumber}} Is Out for Delivery!',
    body: htmlWrap(
      'Out for Delivery',
      `
      <h2 style="color:#333;margin:0 0 16px;">Out for Delivery! 📬</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your order <strong>#{{orderNumber}}</strong> is out for delivery and will arrive today!
      </p>
      <div style="background-color:#f0f0f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:14px;color:#555;margin:0 0 8px;">Tracking Number</p>
        <p style="font-size:20px;font-weight:bold;color:#333;margin:0;letter-spacing:2px;">{{trackingNumber}}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{trackingUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Track Live</a>
      </div>
    `,
    ),
    description: 'Sent when package is out for delivery',
  },
  {
    name: 'Order Delivered',
    code: 'order_delivered',
    subject: 'Your Order #{{orderNumber}} Has Been Delivered!',
    body: htmlWrap(
      'Order Delivered',
      `
      <h2 style="color:#333;margin:0 0 16px;">Delivered! ✅</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Your order <strong>#{{orderNumber}}</strong> has been delivered. We hope you love your purchase!
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        If you are satisfied, please take a moment to leave a review.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{reviewUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Leave a Review</a>
      </div>
    `,
    ),
    description: 'Sent when order is delivered',
  },
  {
    name: 'Shipment Status Update',
    code: 'shipment_status_update',
    subject: 'Shipment Update for Order #{{orderNumber}}',
    body: htmlWrap(
      'Shipment Status Update',
      `
      <h2 style="color:#333;margin:0 0 16px;">Shipment Update 📦</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        There has been an update on your shipment for order <strong>#{{orderNumber}}</strong>.
      </p>
      <table style="width:100%;margin:20px 0;">
        <tr>
          <td style="padding:12px;background-color:#f8f8f8;"><strong>Status</strong></td>
          <td style="padding:12px;background-color:#f8f8f8;color:#1a73e8;font-weight:bold;">{{shipmentStatus}}</td>
        </tr>
        <tr>
          <td style="padding:12px;"><strong>Location</strong></td>
          <td style="padding:12px;">{{currentLocation}}</td>
        </tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{trackingUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Track Shipment</a>
      </div>
    `,
    ),
    description: 'Sent when shipment status changes',
  },

  // ── Cart & Wishlist ──
  {
    name: 'Cart Abandonment Reminder',
    code: 'cart_abandonment',
    subject: 'You Left Something in Your Cart!',
    body: htmlWrap(
      'Cart Abandonment',
      `
      <h2 style="color:#333;margin:0 0 16px;">Your Cart is Waiting! 🛒</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        You have items in your cart that are waiting for you. Do not miss out!
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background-color:#f8f8f8;">
            <th style="padding:12px;text-align:left;">Item</th>
            <th style="padding:12px;text-align:center;">Qty</th>
            <th style="padding:12px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:12px;">{{this.name}}</td>
            <td style="padding:12px;text-align:center;">{{this.quantity}}</td>
            <td style="padding:12px;text-align:right;">\${{this.price}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
      <p style="color:#555;font-size:18px;text-align:right;margin:16px 0;"><strong>Cart Total: \${{cartTotal}}</strong></p>
      <div style="background-color:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
        <p style="font-size:14px;color:#856404;margin:0 0 4px;">Complete your order now and save!</p>
        <p style="font-size:22px;font-weight:bold;color:#333;margin:0;letter-spacing:4px;">{{discountCode}}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{cartUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Return to Cart</a>
      </div>
    `,
    ),
    description: 'Sent when a user abandons their cart with items',
  },
  {
    name: 'Wishlist Back in Stock',
    code: 'wishlist_back_in_stock',
    subject: 'An Item from Your Wishlist Is Back in Stock!',
    body: htmlWrap(
      'Back in Stock',
      `
      <h2 style="color:#333;margin:0 0 16px;">Back in Stock! 🎉</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Good news! An item from your wishlist is back in stock.
      </p>
      <div style="background-color:#f8f8f8;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:18px;font-weight:bold;color:#333;margin:0 0 8px;">{{productName}}</p>
        <p style="font-size:14px;color:#555;margin:0;">{{productDescription}}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{productUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">View Product</a>
      </div>
    `,
    ),
    description: 'Sent when a wishlist item is back in stock',
  },
  {
    name: 'Wishlist Promotion',
    code: 'wishlist_promotion',
    subject: 'Items from Your Wishlist Are on Sale!',
    body: htmlWrap(
      'Wishlist Promotion',
      `
      <h2 style="color:#333;margin:0 0 16px;">Wishlist Items on Sale! 🏷️</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        Great news! Some items from your wishlist are now on sale. Grab them before they sell out!
      </p>
      {{#each items}}
      <div style="background-color:#f8f8f8;border-radius:8px;padding:16px;margin:12px 0;">
        <p style="font-size:16px;font-weight:bold;color:#333;margin:0 0 4px;">{{this.name}}</p>
        <p style="font-size:14px;color:#888;margin:0;">
          <span style="text-decoration:line-through;">\${{this.originalPrice}}</span>
          <span style="color:#dc3545;font-weight:bold;margin-left:8px;">\${{this.salePrice}}</span>
        </p>
      </div>
      {{/each}}
      <div style="background-color:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
        <p style="font-size:14px;color:#856404;margin:0 0 4px;">Extra discount on wishlist items!</p>
        <p style="font-size:22px;font-weight:bold;color:#333;margin:0;letter-spacing:4px;">{{discountCode}}</p>
        <p style="font-size:14px;color:#856404;margin:4px 0 0;">{{discountAmount}}% OFF</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{wishlistUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">View Wishlist</a>
      </div>
    `,
    ),
    description: 'Sent when wishlist items go on sale with an extra discount',
  },

  // ── Promotions & Sales ──
  {
    name: 'Price Drop Alert',
    code: 'price_drop_alert',
    subject: 'Price Dropped on {{productName}}!',
    body: htmlWrap(
      'Price Drop',
      `
      <h2 style="color:#333;margin:0 0 16px;">Price Dropped! 📉</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        The price has dropped on <strong>{{productName}}</strong>!
      </p>
      <div style="background-color:#f8f8f8;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:16px;color:#888;margin:0 0 8px;text-decoration:line-through;">Was: \${{oldPrice}}</p>
        <p style="font-size:28px;font-weight:bold;color:#dc3545;margin:0;">Now: \${{newPrice}}</p>
        <p style="font-size:14px;color:#888;margin:8px 0 0;">You save \${{savings}}!</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{productUrl}}" style="background-color:#dc3545;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Buy Now</a>
      </div>
    `,
    ),
    description: 'Sent when the price drops on a product the user is watching',
  },
  {
    name: 'Sales Promotion',
    code: 'sales_promotion',
    subject: '{{saleName}} – Up to {{discountAmount}}% Off!',
    body: htmlWrap(
      'Sales Promotion',
      `
      <h2 style="color:#333;margin:0 0 16px;">{{saleName}} 🎉</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        We are running an exciting promotion just for you! Do not miss out on these amazing deals.
      </p>
      <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);border-radius:8px;padding:32px;text-align:center;margin:24px 0;">
        <p style="font-size:14px;color:#ffffff;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;">Use Code</p>
        <p style="font-size:32px;font-weight:bold;color:#ffffff;margin:0 0 8px;letter-spacing:6px;">{{discountCode}}</p>
        <p style="font-size:18px;color:#ffffff;margin:0;">Get {{discountAmount}}% OFF</p>
      </div>
      <p style="color:#888;font-size:13px;text-align:center;margin:0 0 20px;">
        Valid until {{validUntil}}. Terms and conditions apply.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{shopUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Shop the Sale</a>
      </div>
    `,
    ),
    description: 'Sent for sales promotions and campaigns',
  },

  // ── Reviews ──
  {
    name: 'Review Reminder',
    code: 'review_reminder',
    subject: 'How Was Your Purchase? Leave a Review!',
    body: htmlWrap(
      'Review Reminder',
      `
      <h2 style="color:#333;margin:0 0 16px;">We Value Your Feedback ⭐</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 8px;">Hi {{firstName}},</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        We hope you are enjoying your purchase! Please take a moment to leave a review and help other customers make informed decisions.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{reviewUrl}}" style="background-color:#1a73e8;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Write a Review</a>
      </div>
      <p style="color:#888;font-size:13px;text-align:center;margin:20px 0 0;">
        Your review will help thousands of sports enthusiasts like you!
      </p>
    `,
    ),
    description: 'Sent as a reminder to review purchased products',
  },

  // ── Admin / Internal ──
  {
    name: 'Low Stock Alert',
    code: 'low_stock_alert',
    subject: 'Low Stock Alert: {{productName}} (SKU: {{sku}})',
    body: htmlWrap(
      'Low Stock Alert',
      `
      <h2 style="color:#333;margin:0 0 16px;">Low Stock Alert ⚠️</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        The following product is running low on stock:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr>
          <td style="padding:12px;background-color:#f8f8f8;"><strong>Product</strong></td>
          <td style="padding:12px;background-color:#f8f8f8;">{{productName}}</td>
        </tr>
        <tr>
          <td style="padding:12px;"><strong>SKU</strong></td>
          <td style="padding:12px;">{{sku}}</td>
        </tr>
        <tr>
          <td style="padding:12px;background-color:#f8f8f8;"><strong>Current Quantity</strong></td>
          <td style="padding:12px;background-color:#f8f8f8;color:#dc3545;font-weight:bold;">{{currentQuantity}}</td>
        </tr>
        <tr>
          <td style="padding:12px;"><strong>Threshold</strong></td>
          <td style="padding:12px;">{{threshold}}</td>
        </tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="{{inventoryUrl}}" style="background-color:#dc3545;color:#ffffff;padding:14px 36px;border-radius:4px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">View Inventory</a>
      </div>
    `,
    ),
    description: 'Internal alert when product stock is low',
  },
];

async function seed() {
  console.log('Connecting...');
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  // Create email_templates table if not exists
  const tableExists = await qr.hasTable('email_templates');
  if (!tableExists) {
    console.log('Creating email_templates table...');
    await qr.createTable(
      new Table({
        name: 'email_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
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
    await qr.createIndex(
      'email_templates',
      new TableIndex({
        name: 'idx_email_templates_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );
    console.log('Table created');
  }

  // Clear existing templates
  try {
    await qr.query(`DELETE FROM "email_templates"`);
  } catch (e) {
    console.log('Clearing error:', (e as Error).message);
  }
  console.log('Cleared email_templates data');

  for (const tpl of templates) {
    const id = uuid();
    const now = new Date();
    await qr.query(
      `INSERT INTO "email_templates" (id, name, code, subject, body, is_active, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $7, $7)`,
      [id, tpl.name, tpl.code, tpl.subject, tpl.body, tpl.description, now],
    );
    console.log(`  ✓ ${tpl.code}`);
  }

  console.log(`\nSeeded ${templates.length} email templates successfully!`);
  await qr.release();
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
