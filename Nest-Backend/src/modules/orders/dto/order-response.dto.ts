import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

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
  @Expose() @ApiProperty() createdAt: Date;
}

@Exclude()
export class OrderResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() orderNumber: string;
  @Expose() @ApiProperty() userId: string;
  @Expose() @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @Expose() @ApiProperty() subtotal: number;
  @Expose() @ApiProperty() discountAmount: number;
  @Expose() @ApiProperty() shippingAmount: number;
  @Expose() @ApiProperty() taxAmount: number;
  @Expose() @ApiProperty() totalAmount: number;
  @Expose() @ApiPropertyOptional() notes: string | null;
  @Expose()
  @Type(() => OrderItemResponseDto)
  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
