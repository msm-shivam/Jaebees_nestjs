import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { PaymentStatus } from '../entities/payment-status.enum';

@Exclude()
export class PaymentLogResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() paymentId: string;
  @Expose() @ApiProperty() action: string;
  @Expose() @ApiPropertyOptional() message: string | null;
  @Expose() @ApiPropertyOptional() performedBy: string | null;
  @Expose() @ApiProperty() createdAt: Date;
}

@Exclude()
export class PaymentRefundResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() paymentId: string;
  @Expose() @ApiProperty() refundAmount: number;
  @Expose() @ApiPropertyOptional() reason: string | null;
  @Expose() @ApiPropertyOptional() notes: string | null;
  @Expose() @ApiPropertyOptional() stripeRefundId: string | null;
  @Expose() @ApiPropertyOptional() processedBy: string | null;
  @Expose() @ApiPropertyOptional() processedAt: Date | null;
  @Expose() @ApiProperty() createdAt: Date;
}

@Exclude()
export class PaymentResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() orderId: string;
  @Expose() @ApiPropertyOptional() paymentMethodId: string | null;
  @Expose() @ApiProperty() transactionNumber: string;
  @Expose() @ApiProperty() amount: number;
  @Expose() @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @Expose() @ApiPropertyOptional() stripePaymentIntentId: string | null;
  @Expose() @ApiPropertyOptional() stripeChargeId: string | null;
  @Expose() @ApiPropertyOptional() gatewayStatus: string | null;
  @Expose() @ApiPropertyOptional() notes: string | null;
  @Expose() @ApiPropertyOptional() paidAt: Date | null;
  @Expose() @ApiPropertyOptional() createdAt: Date;
  @Expose() @ApiPropertyOptional() updatedAt: Date;
  @Expose()
  @Type(() => PaymentRefundResponseDto)
  @ApiPropertyOptional({ type: [PaymentRefundResponseDto] })
  refunds?: PaymentRefundResponseDto[];
  @Expose()
  @Type(() => PaymentLogResponseDto)
  @ApiPropertyOptional({ type: [PaymentLogResponseDto] })
  logs?: PaymentLogResponseDto[];
}

@Exclude()
export class PaymentIntentResponseDto {
  @Expose()
  @ApiProperty({ example: 'pi_xxxxx_secret_xxxxx' })
  clientSecret: string;

  @Expose()
  @ApiProperty({ example: 'pi_3Pxxxxx' })
  paymentIntentId: string;
}

@Exclude()
export class PaymentSummaryDto {
  @Expose() @ApiProperty() orderNumber: string;
  @Expose() @ApiProperty() grandTotal: number;
  @Expose() @ApiProperty() paidAmount: number;
  @Expose() @ApiProperty() dueAmount: number;
  @Expose() @ApiProperty({ enum: PaymentStatus }) paymentStatus: PaymentStatus;
}

@Exclude()
export class ConfirmPaymentResponseDto {
  @Expose() @ApiProperty() message: string;
  @Expose()
  @Type(() => PaymentResponseDto)
  @ApiProperty({ type: PaymentResponseDto })
  data: PaymentResponseDto;
}
