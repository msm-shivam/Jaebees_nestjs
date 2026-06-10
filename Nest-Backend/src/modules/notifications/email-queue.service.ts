import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export const EMAIL_QUEUE = 'email';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  async enqueue(data: {
    to: string;
    subject: string;
    html: string;
    userId?: string;
    templateCode?: string;
  }): Promise<void> {
    try {
      await this.emailQueue.add('send', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      this.logger.error(`Failed to enqueue email: ${error.message}`);
    }
  }
}
