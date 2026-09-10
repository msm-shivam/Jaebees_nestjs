import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EMAIL_QUEUE } from './email-queue.service';
import { EmailService } from './email.service';
import { NotificationLogService } from './notification-log.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @Process('send')
  async handleSend(
    job: Job<{
      to: string;
      subject: string;
      html: string;
      userId?: string;
      templateCode?: string;
      from?: string;
      replyTo?: string;
      logId?: string;
    }>,
  ): Promise<void> {
    this.logger.log(`Processing email job ${job.id}: ${job.data.to}`);
    const sent = await this.emailService.sendEmail({
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
      from: job.data.from,
      replyTo: job.data.replyTo,
    });
    if (!sent) {
      const errMsg = `Failed to send email to ${job.data.to}`;
      if (job.data.logId) {
        await this.notificationLogService.markFailed(job.data.logId, errMsg).catch(() => {});
      }
      throw new Error(errMsg);
    }
    if (job.data.logId) {
      await this.notificationLogService.markSent(job.data.logId).catch(() => {});
    }
  }
}
