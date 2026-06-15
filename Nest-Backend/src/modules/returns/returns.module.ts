import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequest } from './entities/return-request.entity';
import { ReturnItem } from './entities/return-item.entity';
import { ReverseShipment } from './entities/reverse-shipment.entity';
import { ReturnAudit } from './entities/return-audit.entity';
import { ReturnReasonMaster } from './entities/return-reason-master.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ReturnService } from './services/return.service';
import { ReverseLogisticsService } from './services/reverse-logistics.service';
import { ReturnAnalyticsService } from './services/return-analytics.service';
import { CustomerReturnController } from './controllers/customer-return.controller';
import { AdminReturnController } from './controllers/admin-return.controller';
import { AdminReturnAnalyticsController } from './controllers/admin-return-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReturnRequest,
      ReturnItem,
      ReverseShipment,
      ReturnAudit,
      ReturnReasonMaster,
      Order,
      OrderItem,
      Inventory,
    ]),
  ],
  controllers: [
    CustomerReturnController,
    AdminReturnController,
    AdminReturnAnalyticsController,
  ],
  providers: [ReturnService, ReverseLogisticsService, ReturnAnalyticsService],
  exports: [ReturnService],
})
export class ReturnsModule {}
