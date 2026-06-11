import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReverseShipment } from '../entities/reverse-shipment.entity';
import { ReturnRequest } from '../entities/return-request.entity';
import { ReturnAudit } from '../entities/return-audit.entity';
import { ReverseShipmentStatus } from '../enums/reverse-shipment-status.enum';

@Injectable()
export class ReverseLogisticsService {
  constructor(
    @InjectRepository(ReverseShipment)
    private readonly shipmentRepo: Repository<ReverseShipment>,
    @InjectRepository(ReturnRequest)
    private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(ReturnAudit)
    private readonly auditRepo: Repository<ReturnAudit>,
  ) {}

  async findByReturnId(returnId: string) {
    return this.shipmentRepo.find({ where: { returnRequestId: returnId }, order: { createdAt: 'DESC' } });
  }

  async updateStatus(
    returnId: string,
    status: ReverseShipmentStatus,
    adminId: string,
    trackingNumber?: string,
  ) {
    const shipment = await this.shipmentRepo.findOne({ where: { returnRequestId: returnId } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    shipment.status = status;
    if (trackingNumber) shipment.trackingNumber = trackingNumber;
    if (status === ReverseShipmentStatus.DELIVERED) shipment.deliveredDate = new Date();
    await this.shipmentRepo.save(shipment);

    if (status === ReverseShipmentStatus.IN_TRANSIT) {
      await this.returnRepo.update(returnId, { status: 'IN_TRANSIT' as any });
    }
    if (status === ReverseShipmentStatus.DELIVERED) {
      await this.returnRepo.update(returnId, { status: 'RECEIVED' as any });
    }

    const audit = this.auditRepo.create({
      returnRequestId: returnId,
      performedBy: adminId,
      action: `SHIPMENT_${status}`,
      notes: trackingNumber ? `Tracking: ${trackingNumber}` : undefined,
    });
    await this.auditRepo.save(audit);

    return { message: `Shipment status updated to ${status}` };
  }
}
