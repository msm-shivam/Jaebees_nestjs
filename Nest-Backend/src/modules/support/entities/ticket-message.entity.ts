import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';
import { SenderType } from '../enums/sender-type.enum';

@Entity('ticket_messages')
@Index(['ticketId'])
@Index(['createdAt'])
export class TicketMessage extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (t) => t.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_type', type: 'enum', enum: SenderType })
  senderType: SenderType;

  @Column({ type: 'text' })
  message: string;
}
