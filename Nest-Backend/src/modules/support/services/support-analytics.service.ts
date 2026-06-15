import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../entities/support-ticket.entity';
import { TicketSlaLog } from '../entities/ticket-sla-log.entity';
import { TicketStatus } from '../enums/ticket-status.enum';

@Injectable()
export class SupportAnalyticsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
    @InjectRepository(TicketSlaLog)
    private readonly slaLogRepo: Repository<TicketSlaLog>,
  ) {}

  async getSummary() {
    const total = await this.ticketRepo.count();
    const open = await this.ticketRepo.count({
      where: { status: TicketStatus.OPEN },
    });
    const assigned = await this.ticketRepo.count({
      where: { status: TicketStatus.ASSIGNED },
    });
    const inProgress = await this.ticketRepo.count({
      where: { status: TicketStatus.IN_PROGRESS },
    });
    const resolved = await this.ticketRepo.count({
      where: { status: TicketStatus.RESOLVED },
    });
    const closed = await this.ticketRepo.count({
      where: { status: TicketStatus.CLOSED },
    });

    const avgResponse = await this.slaLogRepo
      .createQueryBuilder('sla')
      .select('AVG(sla.response_minutes)', 'avg')
      .where('sla.response_minutes IS NOT NULL')
      .getRawOne();

    const avgResolution = await this.slaLogRepo
      .createQueryBuilder('sla')
      .select('AVG(sla.resolution_minutes)', 'avg')
      .where('sla.resolution_minutes IS NOT NULL')
      .getRawOne();

    return {
      totalTickets: total,
      openTickets: open,
      assignedTickets: assigned,
      inProgressTickets: inProgress,
      resolvedTickets: resolved,
      closedTickets: closed,
      averageFirstResponseMinutes: Math.round(Number(avgResponse?.avg || 0)),
      averageResolutionMinutes: Math.round(Number(avgResolution?.avg || 0)),
    };
  }

  async getCategoryBreakdown() {
    return this.ticketRepo
      .createQueryBuilder('t')
      .select('t.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.category')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async getAgentPerformance() {
    return this.ticketRepo
      .createQueryBuilder('t')
      .select('t.assigned_to', 'agentId')
      .addSelect('COUNT(*)', 'ticketsAssigned')
      .addSelect(
        'SUM(CASE WHEN t.status = :resolved THEN 1 ELSE 0 END)',
        'ticketsResolved',
      )
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600)',
        'avgResolutionHours',
      )
      .setParameter('resolved', TicketStatus.RESOLVED)
      .where('t.assigned_to IS NOT NULL')
      .groupBy('t.assigned_to')
      .orderBy('ticketsAssigned', 'DESC')
      .limit(20)
      .getRawMany();
  }

  async getSlaSummary() {
    const total = await this.slaLogRepo.count();
    const withResponse = await this.slaLogRepo.count({
      where: { resolvedAt: null as any },
    });
    return {
      totalTracked: total,
      pendingResponse: withResponse,
    };
  }
}
