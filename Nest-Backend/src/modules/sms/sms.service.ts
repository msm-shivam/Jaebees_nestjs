import { Injectable, Inject } from '@nestjs/common';
import type { ISmsProvider } from './interfaces/sms-provider.interface';

export const SMS_PROVIDER = 'SMS_PROVIDER';

@Injectable()
export class SmsService {
  constructor(
    @Inject(SMS_PROVIDER) private readonly provider: ISmsProvider,
  ) {}

  async sendOtp(to: string, otp: string): Promise<boolean> {
    const message = `Your Sport E-Commerce verification code is ${otp}. Valid for 15 minutes.`;
    return this.provider.sendSms(to, message);
  }
}
