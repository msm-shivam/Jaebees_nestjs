import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';

@Entity('ticket_audits')
@Index(['ticketId'])
export class TicketAudit extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (t) => t.audits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: TicketStatus,
    nullable: true,
  })
  previousStatus: TicketStatus | null;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: TicketStatus,
    nullable: true,
  })
  newStatus: TicketStatus | null;

  @Column({
    name: 'previous_priority',
    type: 'enum',
    enum: TicketPriority,
    nullable: true,
  })
  previousPriority: TicketPriority | null;

  @Column({
    name: 'new_priority',
    type: 'enum',
    enum: TicketPriority,
    nullable: true,
  })
  newPriority: TicketPriority | null;

  @Column({ name: 'previous_assignee', type: 'uuid', nullable: true })
  previousAssignee: string | null;

  @Column({ name: 'new_assignee', type: 'uuid', nullable: true })
  newAssignee: string | null;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
