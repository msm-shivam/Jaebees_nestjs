import { registerAs } from '@nestjs/config';

export const mailerConfig = registerAs('mailer', () => ({
  host: process.env.MAIL_HOST ?? 'smtp.ethereal.email',
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER ?? '',
  pass: process.env.MAIL_PASS ?? '',
  from: process.env.MAIL_FROM ?? 'noreply@sports-store.com',
  fromName: process.env.MAIL_FROM_NAME ?? 'Sports Store',
}));
