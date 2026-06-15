import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EMAIL_QUEUE } from './email-queue.service';
import { EmailService } from './email.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send')
  async handleSend(
    job: Job<{
      to: string;
      subject: string;
      html: string;
      userId?: string;
      templateCode?: string;
    }>,
  ): Promise<void> {
    this.logger.log(`Processing email job ${job.id}: ${job.data.to}`);
    const sent = await this.emailService.sendEmail({
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
    });
    if (!sent) {
      throw new Error(`Failed to send email to ${job.data.to}`);
    }
  }
}
