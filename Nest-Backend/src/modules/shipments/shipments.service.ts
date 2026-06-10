import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Shipment } from './entities/shipment.entity';
import { ShipmentTrackingLog } from './entities/shipment-tracking-log.entity';
import { ShipmentStatus } from './entities/shipment-status.enum';
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
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [items, total] = await this.shipmentRepo.findAndCount({
      where,
      relations: { warehouse: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  }

  async findOne(id: string) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: { trackingLogs: true, warehouse: true },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async updateStatus(
    id: string,
    dto: UpdateShipmentStatusDto,
    changedBy: string,
  ) {
    const shipment = await this.findOne(id);

    if (dto.status) {
      shipment.status = dto.status;

      if (dto.status === ShipmentStatus.OUT_FOR_DELIVERY) {
        shipment.dispatchedAt = new Date();
      }
      if (dto.status === ShipmentStatus.DELIVERED) {
        shipment.deliveredAt = new Date();
      }

      await this.createLog(id, dto.status, dto.notes ?? null, changedBy);
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

    return {
      message: 'Shipment status updated successfully.',
      data: shipment,
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
    } catch {}
  }

  private async createLog(
    shipmentId: string,
    status: ShipmentStatus,
    note: string | null,
    changedBy: string | null,
  ) {
    const log = this.logRepo.create({ shipmentId, status, note, changedBy });
    return this.logRepo.save(log);
  }
}
