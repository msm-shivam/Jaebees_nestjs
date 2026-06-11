import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';

@Entity('ticket_assignments')
@Index(['ticketId'])
export class TicketAssignment extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (t) => t.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({ name: 'assigned_to', type: 'uuid' })
  assignedTo: string;

  @ManyToOne(() => AdminUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assigned_to' })
  assignedAdmin: AdminUser;

  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy: string;
}
