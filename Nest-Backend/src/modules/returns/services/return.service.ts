import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReturnRequest } from '../entities/return-request.entity';
import { ReturnItem } from '../entities/return-item.entity';
import { ReverseShipment } from '../entities/reverse-shipment.entity';
import { ReturnAudit } from '../entities/return-audit.entity';
import { ReturnReasonMaster } from '../entities/return-reason-master.entity';
import { ReturnRequestStatus } from '../enums/return-request-status.enum';
import { ReverseShipmentStatus } from '../enums/reverse-shipment-status.enum';
import { CreateReturnDto } from '../dto/create-return.dto';
import { SchedulePickupDto } from '../dto/schedule-pickup.dto';
import { ProcessRefundDto } from '../dto/process-refund.dto';
import { RejectReturnDto } from '../dto/reject-return.dto';
import { ReturnQueryDto } from '../dto/return-query.dto';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class ReturnService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(ReturnItem)
    private readonly returnItemRepo: Repository<ReturnItem>,
    @InjectRepository(ReverseShipment)
    private readonly shipmentRepo: Repository<ReverseShipment>,
    @InjectRepository(ReturnAudit)
    private readonly auditRepo: Repository<ReturnAudit>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateReturnDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: { user: true, items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId)
      throw new ForbiddenException('This order does not belong to you');
    if (order.status !== 'DELIVERED')
      throw new BadRequestException('Only delivered orders can be returned');

    const hoursSinceDelivery = this.getHoursSince(order.updatedAt);
    if (hoursSinceDelivery > 24)
      throw new BadRequestException('Return window of 24 hours has expired');

    const existing = await this.returnRepo.findOne({
      where: {
        orderId: dto.orderId,
        userId,
        status: ReturnRequestStatus.REQUESTED,
      },
    });
    if (existing)
      throw new BadRequestException(
        'An active return request already exists for this order',
      );

    for (const item of dto.items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem)
        throw new NotFoundException(`Order item ${item.orderItemId} not found`);
      if (item.quantity > orderItem.quantity)
        throw new BadRequestException(
          `Return quantity exceeds purchased quantity for item ${item.orderItemId}`,
        );
    }

    const returnNumber = await this.generateReturnNumber();

    const returnRequest = this.returnRepo.create({
      returnNumber,
      orderId: dto.orderId,
      userId,
      reason: dto.reason,
      notes: dto.notes,
      status: ReturnRequestStatus.REQUESTED,
      requestedAt: new Date(),
      items: dto.items.map((item) =>
        this.returnItemRepo.create({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason: item.reason,
          condition: item.condition,
          refundAmount: 0,
        }),
      ),
    });

    const saved = await this.returnRepo.save(returnRequest);

    await this.createAudit(
      saved.id,
      null,
      'RETURN_CREATED',
      'Return request created by customer',
    );

    await this.notificationsService.sendTemplatedEmail({
      to: order.user.email,
      templateCode: 'return_requested' as any,
      context: {
        firstName: order.user.firstName,
        returnNumber,
        orderNumber: order.orderNumber,
      },
    });

    return { message: 'Return request created successfully', data: saved };
  }

  async findMyReturns(userId: string, query: ReturnQueryDto) {
    const qb = this.returnRepo
      .createQueryBuilder('return')
      .leftJoinAndSelect('return.items', 'items')
      .leftJoinAndSelect('return.shipments', 'shipments')
      .where('return.user_id = :userId', { userId });

    if (query.status)
      qb.andWhere('return.status = :status', { status: query.status });
    qb.orderBy('return.requestedAt', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 10;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(returnId: string, userId?: string) {
    const returnRequest = await this.returnRepo.findOne({
      where: { id: returnId },
      relations: { items: true, shipments: true, audits: true, order: true },
    });
    if (!returnRequest) throw new NotFoundException('Return request not found');
    if (userId && returnRequest.userId !== userId)
      throw new ForbiddenException('Access denied');
    return returnRequest;
  }

  async cancel(returnId: string, userId: string) {
    const returnRequest = await this.findOne(returnId, userId);
    if (returnRequest.status !== ReturnRequestStatus.REQUESTED) {
      throw new BadRequestException('Only requested returns can be cancelled');
    }
    returnRequest.status = ReturnRequestStatus.REJECTED;
    await this.returnRepo.save(returnRequest);
    await this.createAudit(
      returnId,
      null,
      'RETURN_CANCELLED',
      'Return cancelled by customer',
    );
    return { message: 'Return request cancelled' };
  }

  async findAll(query: ReturnQueryDto) {
    const qb = this.returnRepo
      .createQueryBuilder('return')
      .leftJoinAndSelect('return.items', 'items')
      .leftJoinAndSelect('return.shipments', 'shipments')
      .leftJoinAndSelect('return.user', 'user');

    if (query.status)
      qb.andWhere('return.status = :status', { status: query.status });
    qb.orderBy('return.requestedAt', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async approve(returnId: string, adminId: string) {
    const returnRequest = await this.findOne(returnId);
    if (returnRequest.status !== ReturnRequestStatus.REQUESTED) {
      throw new BadRequestException('Only requested returns can be approved');
    }
    returnRequest.status = ReturnRequestStatus.APPROVED;
    returnRequest.approvedAt = new Date();
    await this.returnRepo.save(returnRequest);
    await this.createAudit(
      returnId,
      adminId,
      'RETURN_APPROVED',
      'Return request approved',
    );

    if (returnRequest.order?.user?.email) {
      await this.notificationsService.sendTemplatedEmail({
        to: returnRequest.order.user.email,
        templateCode: 'return_approved' as any,
        context: {
          firstName: returnRequest.order.user.firstName,
          returnNumber: returnRequest.returnNumber,
        },
      });
    }

    return { message: 'Return request approved' };
  }

  async reject(returnId: string, adminId: string, dto: RejectReturnDto) {
    const returnRequest = await this.findOne(returnId);
    if (returnRequest.status !== ReturnRequestStatus.REQUESTED) {
      throw new BadRequestException('Only requested returns can be rejected');
    }
    returnRequest.status = ReturnRequestStatus.REJECTED;
    returnRequest.notes = dto.reason
      ? `${returnRequest.notes ? returnRequest.notes + ' | ' : ''}Rejected: ${dto.reason}`
      : returnRequest.notes;
    await this.returnRepo.save(returnRequest);
    await this.createAudit(
      returnId,
      adminId,
      'RETURN_REJECTED',
      dto.reason || 'Return request rejected',
    );

    if (returnRequest.order?.user?.email) {
      await this.notificationsService.sendTemplatedEmail({
        to: returnRequest.order.user.email,
        templateCode: 'return_rejected' as any,
        context: {
          firstName: returnRequest.order.user.firstName,
          returnNumber: returnRequest.returnNumber,
          reason: dto.reason || 'N/A',
        },
      });
    }

    return { message: 'Return request rejected' };
  }

  async schedulePickup(
    returnId: string,
    adminId: string,
    dto: SchedulePickupDto,
  ) {
    const returnRequest = await this.findOne(returnId);
    if (returnRequest.status !== ReturnRequestStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved returns can schedule pickup',
      );
    }

    const shipment = this.shipmentRepo.create({
      returnRequestId: returnId,
      courierName: dto.courierName,
      status: ReverseShipmentStatus.PICKED_UP,
      pickupDate: new Date(dto.pickupDate),
    });
    await this.shipmentRepo.save(shipment);

    returnRequest.status = ReturnRequestStatus.PICKUP_SCHEDULED;
    await this.returnRepo.save(returnRequest);

    await this.createAudit(
      returnId,
      adminId,
      'PICKUP_SCHEDULED',
      `Pickup scheduled with ${dto.courierName}`,
    );

    return { message: 'Pickup scheduled', data: shipment };
  }

  async markReceived(returnId: string, adminId: string) {
    const returnRequest = await this.findOne(returnId);
    if (returnRequest.status !== ReturnRequestStatus.IN_TRANSIT) {
      throw new BadRequestException(
        'Return must be in transit before marking received',
      );
    }

    returnRequest.status = ReturnRequestStatus.RECEIVED;
    await this.returnRepo.save(returnRequest);

    await this.createAudit(
      returnId,
      adminId,
      'RETURN_RECEIVED',
      'Return received at warehouse',
    );

    return { message: 'Return marked as received' };
  }

  async processRefund(
    returnId: string,
    adminId: string,
    dto: ProcessRefundDto,
  ) {
    const returnRequest = await this.findOne(returnId);
    if (returnRequest.status !== ReturnRequestStatus.RECEIVED) {
      throw new BadRequestException(
        'Return must be received before refund can be processed',
      );
    }

    const items = await this.returnItemRepo.find({
      where: { returnRequestId: returnId },
    });
    let totalRefund = 0;
    for (const item of items) {
      const orderItem = await this.orderItemRepo.findOne({
        where: { id: item.orderItemId },
      });
      if (orderItem) {
        const refundAmount = dto.amount
          ? dto.amount / items.length
          : Number(orderItem.unitPrice) * item.quantity;
        item.refundAmount = refundAmount;
        totalRefund += refundAmount;
      }
    }
    await this.returnItemRepo.save(items);

    returnRequest.totalRefundAmount = totalRefund;
    returnRequest.status = ReturnRequestStatus.REFUNDED;
    await this.returnRepo.save(returnRequest);

    for (const item of items) {
      const orderItem = await this.orderItemRepo.findOne({
        where: { id: item.orderItemId },
      });
      if (orderItem) {
        await this.restockInventory(orderItem.variantId, item.quantity);
      }
    }

    await this.createAudit(
      returnId,
      adminId,
      'REFUND_PROCESSED',
      `Refund of ${totalRefund} processed`,
    );

    if (returnRequest.order?.user?.email) {
      await this.notificationsService.sendTemplatedEmail({
        to: returnRequest.order.user.email,
        templateCode: 'return_refunded' as any,
        context: {
          firstName: returnRequest.order.user.firstName,
          returnNumber: returnRequest.returnNumber,
          amount: totalRefund.toFixed(2),
        },
      });
    }

    return { message: 'Refund processed successfully' };
  }

  async complete(returnId: string, adminId: string) {
    const returnRequest = await this.findOne(returnId);
    if (returnRequest.status !== ReturnRequestStatus.REFUNDED) {
      throw new BadRequestException(
        'Return must be refunded before completing',
      );
    }

    returnRequest.status = ReturnRequestStatus.COMPLETED;
    returnRequest.completedAt = new Date();
    await this.returnRepo.save(returnRequest);

    await this.createAudit(
      returnId,
      adminId,
      'RETURN_COMPLETED',
      'Return process completed',
    );

    return { message: 'Return completed' };
  }

  async updateShipmentStatus(
    returnId: string,
    status: ReverseShipmentStatus,
    trackingNumber?: string,
  ) {
    const shipment = await this.shipmentRepo.findOne({
      where: { returnRequestId: returnId },
    });
    if (!shipment)
      throw new NotFoundException('No shipment found for this return');

    shipment.status = status;
    if (trackingNumber) shipment.trackingNumber = trackingNumber;
    if (status === ReverseShipmentStatus.IN_TRANSIT) {
      const returnRequest = await this.returnRepo.findOne({
        where: { id: returnId },
      });
      if (
        returnRequest &&
        returnRequest.status === ReturnRequestStatus.PICKUP_SCHEDULED
      ) {
        returnRequest.status = ReturnRequestStatus.IN_TRANSIT;
        await this.returnRepo.save(returnRequest);
      }
    }
    if (status === ReverseShipmentStatus.DELIVERED) {
      shipment.deliveredDate = new Date();
      const returnRequest = await this.returnRepo.findOne({
        where: { id: returnId },
      });
      if (
        returnRequest &&
        returnRequest.status === ReturnRequestStatus.IN_TRANSIT
      ) {
        returnRequest.status = ReturnRequestStatus.RECEIVED;
        await this.returnRepo.save(returnRequest);
      }
    }

    await this.shipmentRepo.save(shipment);
    return { message: 'Shipment status updated' };
  }

  private async restockInventory(variantId: string, quantity: number) {
    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });
    if (inventory) {
      inventory.quantity = Number(inventory.quantity) + quantity;
      inventory.availableQuantity =
        Number(inventory.availableQuantity) + quantity;
      await this.inventoryRepo.save(inventory);
    }
  }

  private async createAudit(
    returnId: string,
    performedBy: string | null,
    action: string,
    notes?: string,
  ) {
    const audit = this.auditRepo.create({
      returnRequestId: returnId,
      performedBy,
      action,
      notes,
    });
    await this.auditRepo.save(audit);
  }

  private async generateReturnNumber(): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO return_sequence_counters (locked, last_number) VALUES (1, 0)
       ON CONFLICT (locked) DO UPDATE SET last_number = return_sequence_counters.last_number + 1
       RETURNING last_number`,
    );
    const nextNum = result[0]?.last_number ?? 1;
    return `RMA-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;
  }

  private getHoursSince(date: Date): number {
    return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
  }
}
