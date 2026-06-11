import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';

@Entity('ticket_ratings')
@Index(['ticketId'], { unique: true })
export class TicketRating extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid', unique: true })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (t) => t.rating, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;
}
