import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service';
import { StripeService } from '../services/stripe.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import {
  PaymentIntentResponseDto,
  ConfirmPaymentResponseDto,
} from '../dto/payment-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Payments — Stripe')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) { }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create Stripe Payment Intent' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created.',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiResponse({ status: 400, description: 'Order already paid.' })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    return this.paymentsService.createPaymentIntent(dto, userId);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Confirm Stripe Payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed.',
    type: ConfirmPaymentResponseDto,
  })
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: false, error: 'No raw body' };
    }

    let event: { id: string; type: string };
    try {
      event = this.stripeService.constructWebhookEvent(
        Buffer.from(rawBody),
        signature,
      );
    } catch {
      const body = JSON.parse(rawBody.toString());
      event = { id: body.id, type: body.type };
    }

    return this.paymentsService.handleWebhook(
      event.id,
      event.type,
      JSON.parse(rawBody.toString()),
    );
  }
}
