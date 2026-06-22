import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { plainToInstance } from 'class-transformer';
import { Shipment } from './entities/shipment.entity';
import { ShipmentTrackingLog } from './entities/shipment-tracking-log.entity';
import { ShipmentStatus } from './entities/shipment-status.enum';
import { ShipmentResponseDto } from './dto/shipment-response.dto';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { ShipmentQueryDto } from './dto/shipment-query.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentTrackingLog)
    private readonly logRepo: Repository<ShipmentTrackingLog>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createShipment(orderId: string, warehouseId: string) {
    const trackingNumber = `SHIP-${uuidv4().slice(0, 8).toUpperCase()}`;

    const shipment = this.shipmentRepo.create({
      orderId,
      warehouseId,
      trackingNumber,
      status: ShipmentStatus.PENDING,
    });
    const saved = await this.shipmentRepo.save(shipment);

    await this.createLog(
      saved.id,
      ShipmentStatus.PENDING,
      'Shipment created',
      null,
    );

    await this.sendShipmentNotification(orderId, 'created', trackingNumber);

    return saved;
  }

  async findByOrderId(orderId: string) {
    const shipment = await this.shipmentRepo.findOne({
      where: { orderId },
      relations: { trackingLogs: true, warehouse: true },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found for this order');
    }
    return shipment;
  }

  async findAll(query: ShipmentQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const qb = this.shipmentRepo
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.order', 'order')
      .leftJoinAndSelect('order.user', 'customer')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('shipment.trackingLogs', 'trackingLogs')
      .orderBy('shipment.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('shipment.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      qb.andWhere(
        `
      (
        order.orderNumber ILIKE :search
        OR shipment.trackingNumber ILIKE :search
        OR customer.firstName ILIKE :search
        OR customer.lastName ILIKE :search
      )
      `,
        {
          search: `%${query.search}%`,
        },
      );
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    const mappedItems = items.map((shipment) => {
      const customer = shipment.order?.user;
      const address = shipment.order?.shippingAddress;

      let estDelivery: Date | null = null;
      if (shipment.deliveredAt) {
        estDelivery = shipment.deliveredAt;
      } else if (shipment.createdAt) {
        const est = new Date(shipment.createdAt);
        est.setDate(est.getDate() + 5); // Default to 5 days estimation
        estDelivery = est;
      }

      return {
        shipmentId: shipment.id,
        orderId: shipment.order?.orderNumber || shipment.orderId,
        customer: customer
          ? `${customer.firstName} ${customer.lastName}`.trim()
          : 'Unknown',
        carrier: 'Standard Carrier',
        trackingId: shipment.trackingNumber,
        destination: address
          ? `${address.city}, ${address.state || address.country}`
          : 'Unknown',
        estDelivery,
        status: shipment.status,
      };
    });

    const paginated = paginate(mappedItems, total, page, limit);
    const summary = await this.getShipmentSummary();

    return {
      ...paginated,
      metrics: summary,
    };
  }
  async getShipmentSummary() {
    const [
      totalShipments,
      packed,
      dispatched,
      inTransit,
      delivered,
      failed,
      failedDelivery,
    ] = await Promise.all([
      this.shipmentRepo.count(),

      this.shipmentRepo.count({
        where: { status: ShipmentStatus.PACKED },
      }),

      this.shipmentRepo.count({
        where: { status: ShipmentStatus.READY_FOR_DISPATCH },
      }),
      this.shipmentRepo.count({
        where: { status: ShipmentStatus.OUT_FOR_DELIVERY },
      }),

      this.shipmentRepo.count({
        where: { status: ShipmentStatus.DELIVERED },
      }),

      this.shipmentRepo.count({
        where: { status: ShipmentStatus.FAILED_DELIVERY },
      }),
      this.shipmentRepo.count({
        where: { status: ShipmentStatus.PENDING },
      }),
    ]);

    return {
      totalShipments,
      packed,
      dispatched,
      inTransit,
      delivered,
      failed,
      failedDelivery,
    };
  }
  async findOne(id: string): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentRepo
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.order', 'order')
      .leftJoinAndSelect('order.user', 'customer')
      .leftJoinAndSelect('shipment.warehouse', 'warehouse')
      .leftJoinAndSelect('shipment.trackingLogs', 'trackingLogs')
      .where('shipment.id = :id', { id })
      .orderBy('trackingLogs.createdAt', 'DESC')
      .getOne();

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return plainToInstance(ShipmentResponseDto, {
      ...shipment,
      order: shipment.order
        ? {
            id: shipment.order.id,
            orderNumber: shipment.order.orderNumber,
            status: shipment.order.status,
            totalAmount: shipment.order.totalAmount,
            customerName: shipment.order.user
              ? `${shipment.order.user.firstName} ${shipment.order.user.lastName}`
              : null,
          }
        : undefined
    });
}
  private async findEntity(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.order', 'order')
      .leftJoinAndSelect('order.user', 'customer')
      .leftJoinAndSelect('shipment.warehouse', 'warehouse')
      .leftJoinAndSelect('shipment.trackingLogs', 'trackingLogs')
      .where('shipment.id = :id', { id })
      .getOne();
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  private readonly validTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
    [ShipmentStatus.PENDING]: [ShipmentStatus.PACKED, ShipmentStatus.FAILED_DELIVERY],
    [ShipmentStatus.PACKED]: [ShipmentStatus.READY_FOR_DISPATCH, ShipmentStatus.FAILED_DELIVERY],
    [ShipmentStatus.READY_FOR_DISPATCH]: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.FAILED_DELIVERY],
    [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_DELIVERY],
    [ShipmentStatus.DELIVERED]: [],
    [ShipmentStatus.FAILED_DELIVERY]: [ShipmentStatus.OUT_FOR_DELIVERY],
  };

  private validateStatusTransition(
    currentStatus: ShipmentStatus,
    newStatus: ShipmentStatus,
  ): void {
    if (currentStatus === newStatus) {
      throw new BadRequestException(`Shipment is already ${currentStatus}`);
    }
    const allowed = this.validTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateShipmentStatusDto,
    changedBy: string,
  ) {
    const shipment = await this.findEntity(id);

    if (dto.status) {
      this.validateStatusTransition(shipment.status, dto.status);
      shipment.status = dto.status;

      if (dto.status === ShipmentStatus.OUT_FOR_DELIVERY && !shipment.dispatchedAt) {
        shipment.dispatchedAt = new Date();
      }
      if (dto.status === ShipmentStatus.DELIVERED) {
        shipment.deliveredAt = new Date();
      }
      if (dto.status === ShipmentStatus.PENDING || dto.status === ShipmentStatus.PACKED) {
        shipment.dispatchedAt = null;
        shipment.deliveredAt = null;
      }

      const log = await this.createLog(id, dto.status, dto.notes ?? null, changedBy);
      shipment.trackingLogs = [...(shipment.trackingLogs ?? []), log];
    }

    if (dto.notes) {
      shipment.notes = dto.notes;
    }

    await this.shipmentRepo.save(shipment);

    if (dto.status) {
      await this.sendShipmentNotification(
        shipment.orderId,
        dto.status === ShipmentStatus.OUT_FOR_DELIVERY
          ? 'out_for_delivery'
          : dto.status === ShipmentStatus.DELIVERED
            ? 'delivered'
            : 'status_update',
        shipment.trackingNumber,
      );
    }

    const freshLogs = await this.logRepo.find({
      where: { shipmentId: id },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Shipment status updated successfully.',
      data: plainToInstance(ShipmentResponseDto, {
        ...shipment,
        trackingLogs: freshLogs,
        order: shipment.order
          ? {
              id: shipment.order.id,
              orderNumber: shipment.order.orderNumber,
              status: shipment.order.status,
              totalAmount: shipment.order.totalAmount,
              customerName: shipment.order.user
                ? `${shipment.order.user.firstName} ${shipment.order.user.lastName}`
                : null,
            }
          : undefined,
        warehouse: shipment.warehouse
          ? {
              id: shipment.warehouse.id,
              name: shipment.warehouse.name,
              code: shipment.warehouse.code,
              city: shipment.warehouse.city,
              state: shipment.warehouse.state,
              country: shipment.warehouse.country,
            }
          : undefined,
      }),
    };
  }

  private async sendShipmentNotification(
    orderId: string,
    type: 'created' | 'out_for_delivery' | 'delivered' | 'status_update',
    trackingNumber: string,
  ) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: { user: true },
      });
      if (!order?.user) return;

      if (type === 'created') {
        await this.notificationsService.sendShipmentCreated({
          to: order.user.email,
          userId: order.user.id,
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
          trackingNumber,
        });
      } else if (type === 'out_for_delivery') {
        await this.notificationsService.sendOutForDelivery({
          to: order.user.email,
          userId: order.user.id,
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
          trackingNumber,
        });
      } else if (type === 'delivered') {
        await this.notificationsService.sendDeliveryCompleted({
          to: order.user.email,
          userId: order.user.id,
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
        });
      }
    } catch (error) {
      Logger.error(
        'Failed to send shipment notification:',
        error,
        'ShipmentsService',
      );
    }
  }

  private async createLog(
    shipmentId: string,
    status: ShipmentStatus,
    note: string | null,
    changedBy: string | null,
  ): Promise<ShipmentTrackingLog> {
    const log = this.logRepo.create({
      shipmentId,
      status,
      note,
      changedBy,
    });
    return this.logRepo.save(log);
  }
}
