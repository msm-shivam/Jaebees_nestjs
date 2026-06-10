import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentRefund } from './entities/payment-refund.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { StripeService } from './services/stripe.service';
import { PaymentsService } from './services/payments.service';
import { RefundsService } from './services/refunds.service';
import { PaymentMethodsService } from './services/payment-methods.service';
import { PaymentsController } from './controllers/payments.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { CustomerPaymentsController } from './controllers/customer-payments.controller';
import { PaymentMethodsController } from './controllers/payment-methods.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentMethod,
      PaymentRefund,
      PaymentLog,
      PaymentWebhook,
      Order,
      User,
    ]),
  ],
  controllers: [
    PaymentsController,
    AdminPaymentsController,
    CustomerPaymentsController,
    PaymentMethodsController,
  ],
  providers: [
    StripeService,
    PaymentsService,
    RefundsService,
    PaymentMethodsService,
  ],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
