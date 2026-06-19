import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { PaymentStatus } from '../../payments/entities/payment-status.enum';

@Exclude()
export class OrderItemResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() productId: string;
  @Expose() @ApiProperty() variantId: string;
  @Expose() @ApiProperty() productName: string;
  @Expose() @ApiProperty() sku: string;
  @Expose() @ApiProperty() quantity: number;
  @Expose() @ApiProperty() unitPrice: number;
  @Expose() @ApiProperty() totalPrice: number;
  @Expose() @ApiPropertyOptional() imageUrl?: string;
  @Expose() @ApiPropertyOptional() variantName?: string;
  @Expose() @ApiProperty() createdAt: Date;
}

@Exclude()
export class OrderResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() orderNumber: string;
  @Expose() @ApiProperty() userId: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  userName: string;

  @Expose() @ApiProperty({ enum: OrderStatus }) status: OrderStatus;

  @Expose()
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Payment status synced from payment gateway' })
  paymentStatus?: PaymentStatus;

  @Expose()
  @ApiPropertyOptional({ example: 99.99, description: 'Amount paid by customer' })
  paidAmount?: number;

  @Expose()
  @ApiPropertyOptional({ example: 0, description: 'Amount still due' })
  dueAmount?: number;
  @Expose() @ApiProperty() subtotal: number;
  @Expose() @ApiProperty() discountAmount: number;
  @Expose() @ApiProperty() shippingAmount: number;
  @Expose() @ApiProperty() deliveryCharge: number;
  @Expose() @ApiProperty() codCharge: number;
  @Expose() @ApiProperty() handlingCharge: number;
  @Expose() @ApiProperty() taxAmount: number;
  @Expose() @ApiProperty() totalAmount: number;
  @Expose() @ApiPropertyOptional() shippingAddressId: string | null;
  @Expose() @ApiPropertyOptional() warehouseId: string | null;
  @Expose() @ApiPropertyOptional() distanceKm: number | null;
  @Expose() @ApiPropertyOptional() notes: string | null;
  @Expose()
  @Type(() => OrderItemResponseDto)
  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
