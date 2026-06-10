import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscountResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  couponId?: string;

  @ApiPropertyOptional()
  couponCode?: string;

  @ApiPropertyOptional()
  discountAmount: number;

  @ApiPropertyOptional()
  finalAmount: number;
}
