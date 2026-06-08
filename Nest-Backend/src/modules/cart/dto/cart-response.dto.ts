import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CartItemResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() variantId: string;
  @Expose() @ApiProperty() quantity: number;
  @Expose() @ApiProperty() unitPrice: number;
  @Expose() @ApiProperty() lineTotal: number;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}

@Exclude()
export class CartResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() subtotal: number;
  @Expose() @ApiProperty() totalItems: number;
  @Expose()
  @Type(() => CartItemResponseDto)
  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
