import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';

@Entity('ticket_tags')
@Index(['ticketId'])
@Index(['tag', 'ticketId'], { unique: true })
export class TicketTag extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (t) => t.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({ type: 'varchar', length: 50 })
  tag: string;
}
