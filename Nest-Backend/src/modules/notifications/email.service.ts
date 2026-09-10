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
    const port = Number(config.port) || 587;
    // Auto-resolve secure setting based on standard SMTP ports to prevent Greeting Never Received errors
    const secure =
      port === 465
        ? true
        : port === 587 || port === 2525 || port === 25
        ? false
        : Boolean(config.secure);

    const transportOpts: any = {
      host: config.host,
      port,
      secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    };

    if (config.user && config.pass) {
      transportOpts.auth = {
        user: config.user,
        pass: config.pass,
      };
    }

    return nodemailer.createTransport(transportOpts);
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
    from?: string;
    replyTo?: string;
  }): Promise<boolean> {
    try {
      const from =
        options.from ||
        `"${this.mailConfig.fromName}" <${this.mailConfig.from}>`;
      const mailOptions: nodemailer.SendMailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };
      if (options.replyTo) {
        mailOptions.replyTo = options.replyTo;
      }
      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent to ${options.to} from ${from}: ${options.subject}`,
      );
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
    const port = Number(options.smtpPort || this.mailConfig.port) || 587;
    const secure =
      port === 465
        ? true
        : port === 587 || port === 2525 || port === 25
        ? false
        : options.smtpSecure ?? this.mailConfig.secure;
    const user = options.smtpUser || this.mailConfig.user;
    const pass = options.smtpPass || this.mailConfig.pass;

    const transportOpts: any = {
      host,
      port,
      secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    };

    if (user && pass) {
      transportOpts.auth = { user, pass };
    }

    const testTransporter = nodemailer.createTransport(transportOpts);

    try {
      const fromAddr = user || this.mailConfig.from || 'support@jaebees.com';
      await testTransporter.sendMail({
        from: `"${this.mailConfig.fromName || 'Jaebees'}" <${fromAddr}>`,
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
      throw error;
    }
  }

  renderTemplate(templateBody: string, context: Record<string, any>): string {
    const template = handlebars.compile(templateBody);
    return template(context);
  }
}
