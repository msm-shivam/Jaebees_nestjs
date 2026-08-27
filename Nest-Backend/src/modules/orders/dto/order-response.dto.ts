import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { PaymentStatus } from '../../payments/entities/payment-status.enum';

@Exclude()
export class AddressResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() fullName: string;
  @Expose() @ApiProperty() phone: string;
  @Expose() @ApiProperty() addressLine1: string;
  @Expose() @ApiPropertyOptional() addressLine2?: string;
  @Expose() @ApiProperty() city: string;
  @Expose() @ApiProperty() state: string;
  @Expose() @ApiProperty() country: string;
  @Expose() @ApiProperty() postalCode: string;
}

@Exclude()
export class OrderItemResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() productId: string;
  @Expose() @ApiProperty() variantId: string;
  @Expose() @ApiProperty() productName: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() sku: string;
  @Expose() @ApiProperty() quantity: number;
  @Expose() @ApiProperty() unitPrice: number;
  @Expose() @ApiProperty() price: number;
  @Expose() @ApiProperty() totalPrice: number;
  @Expose() @ApiPropertyOptional() imageUrl?: string;
  @Expose() @ApiPropertyOptional() image?: string;
  @Expose() @ApiPropertyOptional() variantName?: string;
  @Expose() @ApiPropertyOptional() categoryName?: string;
  @Expose() @ApiPropertyOptional() slug?: string;
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
  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Payment status synced from payment gateway',
  })
  paymentStatus?: PaymentStatus;

  @Expose()
  @ApiPropertyOptional({
    example: 99.99,
    description: 'Amount paid by customer',
  })
  paidAmount?: number;

  @Expose()
  @ApiPropertyOptional({ example: 0, description: 'Amount still due' })
  dueAmount?: number;

  @Expose() @ApiProperty() subtotal: number;
  @Expose() @ApiProperty() discountAmount: number;
  @Expose() @ApiProperty() discount: number;
  @Expose() @ApiProperty() shippingAmount: number;
  @Expose() @ApiProperty() shipping: number;
  @Expose() @ApiProperty() deliveryCharge: number;
  @Expose() @ApiProperty() codCharge: number;
  @Expose() @ApiProperty() handlingCharge: number;
  @Expose() @ApiProperty() taxAmount: number;
  @Expose() @ApiProperty() tax: number;
  @Expose() @ApiProperty() totalAmount: number;
  @Expose() @ApiPropertyOptional() shippingAddressId: string | null;

  @Expose()
  @Type(() => AddressResponseDto)
  @ApiPropertyOptional({ type: AddressResponseDto })
  shippingAddress?: AddressResponseDto | null;

  @Expose() @ApiPropertyOptional() warehouseId: string | null;
  @Expose() @ApiPropertyOptional() distanceKm: number | null;
  @Expose() @ApiPropertyOptional() notes: string | null;

  @Expose()
  @Type(() => OrderItemResponseDto)
  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @Expose() @ApiProperty() isCancellable: boolean;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
