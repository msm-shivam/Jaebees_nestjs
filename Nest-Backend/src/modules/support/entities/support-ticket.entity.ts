import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';
import { Order } from '../../orders/entities/order.entity';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketCategory } from '../enums/ticket-category.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketMessage } from './ticket-message.entity';
import { TicketAssignment } from './ticket-assignment.entity';
import { TicketNote } from './ticket-note.entity';
import { TicketSlaLog } from './ticket-sla-log.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { TicketAudit } from './ticket-audit.entity';
import { TicketRating } from './ticket-rating.entity';
import { TicketTag } from './ticket-tag.entity';

@Entity('support_tickets')
@Index(['ticketNumber'], { unique: true })
@Index(['customerId'])
@Index(['status'])
@Index(['priority'])
@Index(['assignedTo'])
@Index(['createdAt'])
export class SupportTicket extends BaseEntity {
  @Column({ name: 'ticket_number', type: 'varchar', length: 50, unique: true })
  ticketNumber: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order | null;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @ManyToOne(() => AdminUser, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedAdmin: AdminUser | null;

  @Column({ name: 'first_response_at', type: 'timestamptz', nullable: true })
  firstResponseAt: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @OneToMany(() => TicketMessage, (msg) => msg.ticket, { cascade: true })
  messages: TicketMessage[];

  @OneToMany(() => TicketAssignment, (ta) => ta.ticket, { cascade: true })
  assignments: TicketAssignment[];

  @OneToMany(() => TicketNote, (note) => note.ticket, { cascade: true })
  notes: TicketNote[];

  @OneToMany(() => TicketSlaLog, (sla) => sla.ticket)
  slaLogs: TicketSlaLog[];

  @OneToMany(() => TicketAttachment, (att) => att.ticket, { cascade: true })
  attachments: TicketAttachment[];

  @OneToMany(() => TicketAudit, (audit) => audit.ticket, { cascade: true })
  audits: TicketAudit[];

  @OneToOne(() => TicketRating, (rating) => rating.ticket)
  rating: TicketRating;

  @OneToMany(() => TicketTag, (tag) => tag.ticket, { cascade: true })
  tags: TicketTag[];
}
