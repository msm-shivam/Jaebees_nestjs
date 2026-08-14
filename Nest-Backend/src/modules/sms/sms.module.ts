import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsService, SMS_PROVIDER } from './sms.service';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    SmsService,
    {
      provide: SMS_PROVIDER,
      useClass: TwilioSmsProvider,
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
