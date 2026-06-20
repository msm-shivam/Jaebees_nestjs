import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { TicketAssignment } from './entities/ticket-assignment.entity';
import { TicketNote } from './entities/ticket-note.entity';
import { TicketSlaLog } from './entities/ticket-sla-log.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { TicketAudit } from './entities/ticket-audit.entity';
import { TicketRating } from './entities/ticket-rating.entity';
import { TicketTag } from './entities/ticket-tag.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { SupportService } from './services/support.service';
import { TicketAssignmentService } from './services/ticket-assignment.service';
import { SlaMonitoringService } from './services/sla-monitoring.service';
import { SupportAnalyticsService } from './services/support-analytics.service';
import { CustomerSupportController } from './controllers/customer-support.controller';
import { AdminSupportController } from './controllers/admin-support.controller';
import { AdminSupportAnalyticsController } from './controllers/admin-support-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupportTicket,
      TicketMessage,
      TicketAssignment,
      TicketNote,
      TicketSlaLog,
      TicketAttachment,
      TicketAudit,
      TicketRating,
      TicketTag,
      Order,
      User,
      AdminUser,
    ]),
  ],
  controllers: [
    CustomerSupportController,
    AdminSupportController,
    AdminSupportAnalyticsController,
  ],
  providers: [
    SupportService,
    TicketAssignmentService,
    SlaMonitoringService,
    SupportAnalyticsService,
  ],
  exports: [SupportService],
})
export class SupportModule {}
