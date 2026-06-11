import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsReceiptItem } from './entities/goods-receipt-item.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { StockAlert } from './entities/stock-alert.entity';
import { InventoryAudit } from './entities/inventory-audit.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { SupplierService } from './services/supplier.service';
import { PurchaseOrderService } from './services/purchase-order.service';
import { GoodsReceiptService } from './services/goods-receipt.service';
import { InventoryPlusService } from './services/inventory-plus.service';
import { InventoryAnalyticsService } from './services/inventory-analytics.service';
import { AdminSupplierController } from './controllers/admin-supplier.controller';
import { AdminPurchaseOrderController } from './controllers/admin-purchase-order.controller';
import { AdminGoodsReceiptController } from './controllers/admin-goods-receipt.controller';
import { AdminInventoryController } from './controllers/admin-inventory.controller';
import { AdminInventoryAnalyticsController } from './controllers/admin-inventory-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      PurchaseOrder,
      PurchaseOrderItem,
      GoodsReceipt,
      GoodsReceiptItem,
      StockAdjustment,
      StockAlert,
      InventoryAudit,
      Inventory,
      ProductVariant,
    ]),
  ],
  controllers: [
    AdminSupplierController,
    AdminPurchaseOrderController,
    AdminGoodsReceiptController,
    AdminInventoryController,
    AdminInventoryAnalyticsController,
  ],
  providers: [
    SupplierService,
    PurchaseOrderService,
    GoodsReceiptService,
    InventoryPlusService,
    InventoryAnalyticsService,
  ],
  exports: [
    SupplierService,
    PurchaseOrderService,
    GoodsReceiptService,
    InventoryPlusService,
    InventoryAnalyticsService,
  ],
})
export class InventoryPlusModule {}
