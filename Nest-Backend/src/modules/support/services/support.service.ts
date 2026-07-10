import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SupportTicket } from '../entities/support-ticket.entity';
import { TicketMessage } from '../entities/ticket-message.entity';
import { TicketAssignment } from '../entities/ticket-assignment.entity';
import { TicketNote } from '../entities/ticket-note.entity';
import { TicketSlaLog } from '../entities/ticket-sla-log.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { TicketAudit } from '../entities/ticket-audit.entity';
import { TicketRating } from '../entities/ticket-rating.entity';
import { TicketTag } from '../entities/ticket-tag.entity';
import { TicketStatus } from '../enums/ticket-status.enum';
import { SenderType } from '../enums/sender-type.enum';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { ReplyTicketDto } from '../dto/reply-ticket.dto';
import { AssignTicketDto } from '../dto/assign-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { TicketTagResponseDto } from '../dto/ticket-tag-response.dto';
import { plainToInstance } from 'class-transformer';
import { NotificationsService } from '../../notifications/notifications.service';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';
import { DefaultPermissions, DefaultRoles } from '../../../common/constants/roles.constants';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
    @InjectRepository(TicketMessage)
    private readonly messageRepo: Repository<TicketMessage>,
    @InjectRepository(TicketAssignment)
    private readonly assignmentRepo: Repository<TicketAssignment>,
    @InjectRepository(TicketNote)
    private readonly noteRepo: Repository<TicketNote>,
    @InjectRepository(TicketSlaLog)
    private readonly slaLogRepo: Repository<TicketSlaLog>,
    @InjectRepository(TicketAttachment)
    private readonly attachmentRepo: Repository<TicketAttachment>,
    @InjectRepository(TicketAudit)
    private readonly auditRepo: Repository<TicketAudit>,
    @InjectRepository(TicketRating)
    private readonly ratingRepo: Repository<TicketRating>,
    @InjectRepository(TicketTag)
    private readonly tagRepo: Repository<TicketTag>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(customerId: string, dto: CreateTicketDto) {
    if (dto.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: dto.orderId },
      });
      if (!order) throw new NotFoundException('Order not found');
      if (order.userId !== customerId)
        throw new ForbiddenException('Order does not belong to you');
    }

    const ticketNumber = await this.generateTicketNumber();

    const ticket = this.ticketRepo.create({
      ticketNumber,
      customerId,
      orderId: dto.orderId || null,
      subject: dto.subject,
      category: dto.category,
      priority: dto.priority || undefined,
      status: TicketStatus.OPEN,
    });
    const saved = await this.ticketRepo.save(ticket);

    const msg = this.messageRepo.create({
      ticketId: saved.id,
      senderId: customerId,
      senderType: SenderType.CUSTOMER,
      message: dto.message,
    });
    await this.messageRepo.save(msg);

    const user = await this.userRepo.findOne({ where: { id: customerId } });
    if (user) {
      await this.notificationsService.sendTemplatedEmail({
        to: user.email,
        templateCode: 'ticket_created' as any,
        context: {
          firstName: user.firstName,
          ticketNumber: saved.ticketNumber,
          subject: saved.subject,
        },
      });
    }

    return { message: 'Ticket created successfully', data: saved };
  }

  async findMyTickets(customerId: string, query: TicketQueryDto) {
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.customer', 'customer')
      .leftJoinAndSelect('t.assignedAdmin', 'assignedAdmin')
      .leftJoinAndSelect('t.messages', 'messages')
      .where('t.customer_id = :customerId', { customerId });

    if (query.status)
      qb.andWhere('t.status = :status', { status: query.status });
    if (query.category)
      qb.andWhere('t.category = :category', { category: query.category });

    qb.orderBy('t.createdAt', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 10;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: plainToInstance(TicketResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
    };
  }

  async findOne(ticketId: string, customerId?: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: {
        customer: true,
        assignedAdmin: true,
        messages: true,
        assignments: { assignedAdmin: true },
        notes: true,
        attachments: true,
        audits: true,
        tags: true,
        rating: true,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (customerId && ticket.customerId !== customerId)
      throw new ForbiddenException('Access denied');
    return ticket;
  }

  async reply(customerId: string, ticketId: string, dto: ReplyTicketDto) {
    const ticket = await this.findOne(ticketId, customerId);
    if (ticket.status === TicketStatus.CLOSED)
      throw new BadRequestException('Ticket is closed');
    if (ticket.status === TicketStatus.RESOLVED)
      throw new BadRequestException('Ticket is resolved, please reopen');

    const msg = this.messageRepo.create({
      ticketId,
      senderId: customerId,
      senderType: SenderType.CUSTOMER,
      message: dto.message,
    });
    await this.messageRepo.save(msg);

    if (
      ticket.status === TicketStatus.REOPENED ||
      ticket.status === TicketStatus.OPEN
    ) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketRepo.save(ticket);
    }

    return { message: 'Reply added' };
  }

  async close(customerId: string, ticketId: string) {
    const ticket = await this.findOne(ticketId, customerId);
    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException(
        'Only resolved tickets can be closed by customer',
      );
    }
    ticket.status = TicketStatus.CLOSED;
    await this.ticketRepo.save(ticket);
    return { message: 'Ticket closed' };
  }

  async findAll(query: TicketQueryDto, adminId?: string) {
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.messages', 'messages')
      .leftJoinAndSelect('t.customer', 'customer')
      .leftJoinAndSelect('t.assignedAdmin', 'assignedAdmin');

    // Agents without SUPPORT_ASSIGN only see their assigned tickets
    if (adminId && !query.assignedTo && !(await this.canViewAllTickets(adminId))) {
      qb.andWhere('t.assigned_to = :assignedTo', { assignedTo: adminId });
    }

    if (query.status)
      qb.andWhere('t.status = :status', { status: query.status });
    if (query.category)
      qb.andWhere('t.category = :category', { category: query.category });
    if (query.priority)
      qb.andWhere('t.priority = :priority', { priority: query.priority });
    if (query.search) {
      qb.andWhere(
        '(t.subject ILIKE :search OR t.ticket_number ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.assignedTo)
      qb.andWhere('t.assigned_to = :assignedTo', {
        assignedTo: query.assignedTo,
      });
    if (query.customer) {
      qb.andWhere(
        '(customer.firstName ILIKE :customer OR customer.lastName ILIKE :customer OR customer.email ILIKE :customer)',
        { customer: `%${query.customer}%` },
      );
    }
    if (query.dateFrom)
      qb.andWhere('t.created_at >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('t.created_at <= :dateTo', { dateTo: query.dateTo });

    qb.orderBy('t.createdAt', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const [openTickets, inProgress, resolved, closed] = await Promise.all([
      this.ticketRepo.count({ where: { status: TicketStatus.OPEN } }),
      this.ticketRepo.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.ticketRepo.count({ where: { status: TicketStatus.RESOLVED } }),
      this.ticketRepo.count({ where: { status: TicketStatus.CLOSED } }),
    ]);

    return {
      tickets: plainToInstance(TicketResponseDto, data),
      total,
      page,
      limit,
      openTickets,
      inProgress,
      resolvedClosed: resolved + closed,
    };
  }

  async assign(ticketId: string, adminId: string, dto: AssignTicketDto) {
    const ticket = await this.findOne(ticketId);
    if (ticket.status === TicketStatus.CLOSED)
      throw new BadRequestException('Cannot assign closed ticket');
    if (ticket.status === TicketStatus.RESOLVED)
      throw new BadRequestException('Cannot assign resolved ticket');

    const adminUser = await this.adminUserRepo.findOne({
      where: { id: dto.assignedTo },
    });
    if (!adminUser) {
      throw new NotFoundException('Assigned admin user not found');
    }

    const previousAssignee = ticket.assignedTo;
    const previousStatus = ticket.status;

    ticket.assignedTo = dto.assignedTo;
    if (ticket.status === TicketStatus.OPEN)
      ticket.status = TicketStatus.ASSIGNED;
    await this.ticketRepo.save(ticket);

    const assignment = this.assignmentRepo.create({
      ticketId,
      assignedTo: dto.assignedTo,
      assignedBy: adminId,
    });
    await this.assignmentRepo.save(assignment);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId,
        action: 'assign',
        previousAssignee,
        newAssignee: dto.assignedTo,
        previousStatus,
        newStatus: ticket.status,
        performedBy: adminId,
      }),
    );

    return { message: 'Ticket assigned' };
  }

  async adminReply(ticketId: string, adminId: string, dto: ReplyTicketDto) {
    const ticket = await this.findOne(ticketId);
    if (ticket.status === TicketStatus.CLOSED)
      throw new BadRequestException('Ticket is closed');

    const msg = this.messageRepo.create({
      ticketId,
      senderId: adminId,
      senderType: SenderType.ADMIN,
      message: dto.message,
    });
    await this.messageRepo.save(msg);

    if (!ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date();
      await this.updateSlaResponse(ticket);
    }

    if (
      ticket.status === TicketStatus.ASSIGNED ||
      ticket.status === TicketStatus.OPEN
    ) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }
    await this.ticketRepo.save(ticket);

    const customer = await this.userRepo.findOne({
      where: { id: ticket.customerId },
    });
    if (customer) {
      await this.notificationsService.sendTemplatedEmail({
        to: customer.email,
        templateCode: 'ticket_reply' as any,
        context: {
          firstName: customer.firstName,
          ticketNumber: ticket.ticketNumber,
        },
      });
    }

    return { message: 'Reply added' };
  }

  async resolve(ticketId: string, adminId: string) {
    const ticket = await this.findOne(ticketId);
    if (ticket.status === TicketStatus.CLOSED)
      throw new BadRequestException('Ticket is already closed');
    if (ticket.status === TicketStatus.RESOLVED)
      throw new BadRequestException('Ticket is already resolved');

    const previousStatus = ticket.status;

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();
    await this.ticketRepo.save(ticket);

    await this.updateSlaResolution(ticket);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId,
        action: 'resolve',
        previousStatus,
        newStatus: TicketStatus.RESOLVED,
        performedBy: adminId,
      }),
    );

    return { message: 'Ticket resolved' };
  }

  async reopen(ticketId: string, adminId?: string) {
    const ticket = await this.findOne(ticketId);
    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException('Only resolved tickets can be reopened');
    }
    const previousStatus = ticket.status;
    ticket.status = TicketStatus.REOPENED;
    ticket.resolvedAt = null;
    await this.ticketRepo.save(ticket);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId,
        action: 'reopen',
        previousStatus,
        newStatus: TicketStatus.REOPENED,
        performedBy: adminId ?? null,
      }),
    );

    return { message: 'Ticket reopened' };
  }

  async addNote(ticketId: string, adminId: string, note: string) {
    const ticket = await this.findOne(ticketId);
    const ticketNote = this.noteRepo.create({
      ticketId,
      note,
      createdBy: adminId,
    });
    await this.noteRepo.save(ticketNote);
    return { message: 'Note added' };
  }

  async uploadAttachment(
    ticketId: string,
    fileUrl: string,
    fileName: string,
    uploadedBy: string,
  ) {
    const attachment = this.attachmentRepo.create({
      ticketId,
      fileUrl,
      fileName,
      uploadedBy,
    });
    await this.attachmentRepo.save(attachment);
    return attachment;
  }

  async getAttachments(ticketId: string) {
    return this.attachmentRepo.find({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAuditHistory(ticketId: string) {
    return this.auditRepo.find({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });
  }

  async rateTicket(
    ticketId: string,
    rating: number,
    customerId: string,
    comment?: string,
  ) {
    const ticket = await this.findOne(ticketId);
    if (ticket.customerId !== customerId)
      throw new ForbiddenException('You can only rate your own tickets');
    if (
      ticket.status !== TicketStatus.RESOLVED &&
      ticket.status !== TicketStatus.CLOSED
    ) {
      throw new BadRequestException('Can only rate resolved or closed tickets');
    }
    const existing = await this.ratingRepo.findOne({ where: { ticketId } });
    if (existing) throw new BadRequestException('Ticket already rated');

    const ratingEntity = this.ratingRepo.create({ ticketId, rating, comment });
    await this.ratingRepo.save(ratingEntity);
    return ratingEntity;
  }

  async addTag(ticketId: string, tag: string): Promise<TicketTagResponseDto> {
    const ticket = await this.findOne(ticketId);
    const existing = await this.tagRepo.findOne({ where: { ticketId, tag } });
    if (existing)
      throw new BadRequestException('Tag already exists on this ticket');
    const tagEntity = this.tagRepo.create({ ticketId, tag });
    await this.tagRepo.save(tagEntity);
    return plainToInstance(TicketTagResponseDto, tagEntity);
  }

  async removeTag(ticketId: string, tagId: string) {
    const result = await this.tagRepo.delete({ id: tagId, ticketId });
    if (result.affected === 0) throw new NotFoundException('Tag not found');
    return { message: 'Tag removed' };
  }

  async getTags(ticketId: string): Promise<TicketTagResponseDto[]> {
    const tags = await this.tagRepo.find({
      where: { ticketId },
      order: { tag: 'ASC' },
    });
    return plainToInstance(TicketTagResponseDto, tags);
  }

  private async updateSlaResponse(ticket: SupportTicket) {
    const minutes = this.minutesSince(ticket.createdAt);
    let sla = await this.slaLogRepo.findOne({ where: { ticketId: ticket.id } });
    if (!sla) {
      sla = this.slaLogRepo.create({
        ticketId: ticket.id,
        firstResponseAt: new Date(),
        responseMinutes: minutes,
      });
    } else {
      sla.firstResponseAt = new Date();
      sla.responseMinutes = minutes;
    }
    await this.slaLogRepo.save(sla);
  }

  private async updateSlaResolution(ticket: SupportTicket) {
    const minutes = this.minutesSince(ticket.createdAt);
    let sla = await this.slaLogRepo.findOne({ where: { ticketId: ticket.id } });
    if (!sla) {
      sla = this.slaLogRepo.create({
        ticketId: ticket.id,
        resolvedAt: new Date(),
        resolutionMinutes: minutes,
      });
    } else {
      sla.resolvedAt = new Date();
      sla.resolutionMinutes = minutes;
    }
    await this.slaLogRepo.save(sla);
  }

  private async generateTicketNumber(): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO ticket_sequence_counters (locked, last_number) VALUES (1, 0)
       ON CONFLICT (locked) DO UPDATE SET last_number = ticket_sequence_counters.last_number + 1
       RETURNING last_number`,
    );
    const nextNum = result[0]?.last_number ?? 1;
    return `TKT-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;
  }

  private minutesSince(date: Date): number {
    return Math.round((Date.now() - new Date(date).getTime()) / 60000);
  }

  private async canViewAllTickets(adminId: string): Promise<boolean> {
    const admin = await this.adminUserRepo.findOne({
      where: { id: adminId },
      relations: { roles: { permissions: true } },
    });
    if (!admin) return false;
    return admin.roles?.some((r) =>
      r.slug === DefaultRoles.SUPER_ADMIN ||
      r.permissions?.some((p) => p.slug === DefaultPermissions.SUPPORT_ASSIGN),
    ) ?? false;
  }
}
