import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { mailerConfig } from '../../config/mailer.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailerConfig.KEY)
    private readonly mailConfig: ConfigType<typeof mailerConfig>,
  ) {
    this.transporter = this.createTransport(this.mailConfig);
  }

  private createTransport(config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  configure(options: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }): void {
    this.transporter = this.createTransport(options);
    this.logger.log('SMTP transporter reconfigured');
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${this.mailConfig.fromName}" <${this.mailConfig.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  async sendTestEmail(options: {
    to: string;
    subject: string;
    html: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    smtpPass?: string;
  }): Promise<boolean> {
    const host = options.smtpHost || this.mailConfig.host;
    const port = options.smtpPort || this.mailConfig.port;
    const secure = options.smtpSecure ?? this.mailConfig.secure;
    const user = options.smtpUser || this.mailConfig.user;
    const pass = options.smtpPass || this.mailConfig.pass;

    const testTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    try {
      await testTransporter.sendMail({
        from: `"${this.mailConfig.fromName}" <${user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Test email sent to ${options.to}`);
      testTransporter.close();
      return true;
    } catch (error) {
      this.logger.error(
        `Test email failed to ${options.to}: ${(error as Error).message}`,
      );
      testTransporter.close();
      return false;
    }
  }

  renderTemplate(templateBody: string, context: Record<string, any>): string {
    const template = handlebars.compile(templateBody);
    return template(context);
  }
}
