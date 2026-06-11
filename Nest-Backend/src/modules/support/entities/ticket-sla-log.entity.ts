import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';

@Entity('ticket_sla_logs')
@Index(['ticketId'])
export class TicketSlaLog extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (t) => t.slaLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({ name: 'first_response_at', type: 'timestamptz', nullable: true })
  firstResponseAt: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'response_minutes', type: 'int', nullable: true })
  responseMinutes: number | null;

  @Column({ name: 'resolution_minutes', type: 'int', nullable: true })
  resolutionMinutes: number | null;
}
