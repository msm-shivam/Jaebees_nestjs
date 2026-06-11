import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ReturnRequest } from './return-request.entity';
import { ReverseShipmentStatus } from '../enums/reverse-shipment-status.enum';

@Entity('reverse_shipments')
@Index(['returnRequestId'])
@Index(['trackingNumber'])
export class ReverseShipment extends BaseEntity {
  @Column({ name: 'return_request_id', type: 'uuid' })
  returnRequestId: string;

  @ManyToOne(() => ReturnRequest, (rr) => rr.shipments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_request_id' })
  returnRequest: ReturnRequest;

  @Column({ name: 'courier_name', type: 'varchar', length: 255, nullable: true })
  courierName: string;

  @Column({ name: 'tracking_number', type: 'varchar', length: 255, nullable: true })
  trackingNumber: string;

  @Column({ type: 'enum', enum: ReverseShipmentStatus, default: ReverseShipmentStatus.PENDING })
  status: ReverseShipmentStatus;

  @Column({ name: 'pickup_date', type: 'timestamptz', nullable: true })
  pickupDate: Date;

  @Column({ name: 'delivered_date', type: 'timestamptz', nullable: true })
  deliveredDate: Date;
}
