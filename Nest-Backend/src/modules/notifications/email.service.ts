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
    this.transporter = nodemailer.createTransport({
      host: this.mailConfig.host,
      port: this.mailConfig.port,
      secure: this.mailConfig.secure,
      auth: {
        user: this.mailConfig.user,
        pass: this.mailConfig.pass,
      },
    });
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
        `Failed to send email to ${options.to}: ${error.message}`,
      );
      return false;
    }
  }

  renderTemplate(templateBody: string, context: Record<string, any>): string {
    const template = handlebars.compile(templateBody);
    return template(context);
  }
}
