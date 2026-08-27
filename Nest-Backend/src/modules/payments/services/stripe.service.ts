/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: any = null;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      const Stripe = require('stripe');
      this.stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
    }
  }

  private getClient(): any {
    if (!this.stripe) {
      throw new Error(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.',
      );
    }
    return this.stripe;
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
    idempotencyKey?: string,
  ) {
    const client = this.getClient();
    const options: Record<string, unknown> = {};
    if (idempotencyKey) {
      options.idempotencyKey = idempotencyKey;
    }
    return await client.paymentIntents.create(
      {
        amount: Math.round(amount * 100),
        currency,
        metadata,
      },
      options,
    );
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const client = this.getClient();
    return await client.paymentIntents.retrieve(paymentIntentId);
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
    idempotencyKey?: string,
  ) {
    const client = this.getClient();
    const params: Record<string, unknown> = {
      payment_intent: paymentIntentId,
    };
    if (amount) params.amount = Math.round(amount * 100);
    if (reason) params.reason = reason;
    const options: Record<string, unknown> = {};
    if (idempotencyKey) {
      options.idempotencyKey = idempotencyKey;
    }
    return await client.refunds.create(params, options);
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const client = this.getClient();
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error(
        'Stripe webhook secret is not configured. Please set STRIPE_WEBHOOK_SECRET in your .env file.',
      );
    }
    return client.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
