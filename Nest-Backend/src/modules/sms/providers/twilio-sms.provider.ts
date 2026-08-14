import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ISmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private client: any = null;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const sid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');

    if (sid && token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Twilio = require('twilio');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.client = Twilio(sid, token);
        this.logger.log('Twilio Programmable Messaging Provider initialized.');
      } catch {
        this.logger.warn('Twilio library not installed. Operating in DEV MOCK SMS mode.');
      }
    } else {
      this.logger.warn('Twilio credentials missing. Operating in DEV MOCK SMS mode.');
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    const formattedTo = this.formatE164(to);
    if (!this.client) {
      this.logger.log(`[DEV MOCK SMS] To: ${formattedTo} | Message: "${message}"`);
      return true;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const res = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(`SMS dispatched to ${formattedTo}. Message SID: ${res.sid}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Twilio SMS dispatch failed to ${formattedTo}: ${(err as Error).message}`);
      return false;
    }
  }

  private formatE164(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
}
