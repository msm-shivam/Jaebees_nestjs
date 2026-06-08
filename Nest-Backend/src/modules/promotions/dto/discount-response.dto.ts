import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscountResponseDto {
  @ApiProperty()
  applicable: boolean;

  @ApiPropertyOptional()
  couponId?: string;

  @ApiPropertyOptional()
  promotionId?: string;

  @ApiPropertyOptional()
  couponCode?: string;

  @ApiPropertyOptional()
  promotionName?: string;

  @ApiProperty()
  discountType: string;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  finalAmount: number;
}
