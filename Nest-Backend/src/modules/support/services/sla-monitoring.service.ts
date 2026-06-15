import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketSlaLog } from '../entities/ticket-sla-log.entity';
import { SupportTicket } from '../entities/support-ticket.entity';
import { TicketPriority } from '../enums/ticket-priority.enum';

interface SlaTargets {
  responseHours: number;
  resolutionHours: number;
}

@Injectable()
export class SlaMonitoringService {
  private readonly slaTargets: Record<TicketPriority, SlaTargets> = {
    [TicketPriority.LOW]: { responseHours: 24, resolutionHours: 72 },
    [TicketPriority.MEDIUM]: { responseHours: 12, resolutionHours: 48 },
    [TicketPriority.HIGH]: { responseHours: 4, resolutionHours: 24 },
    [TicketPriority.URGENT]: { responseHours: 1, resolutionHours: 8 },
  };

  constructor(
    @InjectRepository(TicketSlaLog)
    private readonly slaLogRepo: Repository<TicketSlaLog>,
  ) {}

  async getSlaStatus(ticketId: string) {
    const sla = await this.slaLogRepo.findOne({ where: { ticketId } });
    if (!sla) return { status: 'pending' };
    return sla;
  }

  async checkSlaCompliance(ticket: SupportTicket): Promise<{
    responseCompliant: boolean | null;
    resolutionCompliant: boolean | null;
  }> {
    const sla = await this.slaLogRepo.findOne({
      where: { ticketId: ticket.id },
    });
    if (!sla) return { responseCompliant: null, resolutionCompliant: null };

    const targets = this.slaTargets[ticket.priority];
    const responseCompliant =
      sla.responseMinutes != null
        ? sla.responseMinutes <= targets.responseHours * 60
        : null;
    const resolutionCompliant =
      sla.resolutionMinutes != null
        ? sla.resolutionMinutes <= targets.resolutionHours * 60
        : null;

    return { responseCompliant, resolutionCompliant };
  }

  getSlaTargets(priority: TicketPriority): SlaTargets {
    return this.slaTargets[priority] ?? this.slaTargets[TicketPriority.MEDIUM];
  }
}
