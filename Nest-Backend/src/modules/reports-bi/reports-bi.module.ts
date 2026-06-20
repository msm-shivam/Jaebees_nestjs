import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardSnapshot } from './entities/dashboard-snapshot.entity';
import { ReportExecutionLog } from './entities/report-execution-log.entity';
import { SavedReport } from './entities/saved-report.entity';
import { SalesReportService } from './services/sales-report.service';
import { RevenueReportService } from './services/revenue-report.service';
import { ProductReportService } from './services/product-report.service';
import { CustomerReportService } from './services/customer-report.service';
import { InventoryReportService } from './services/inventory-report.service';
import { ReturnReportService } from './services/return-report.service';
import { SupportReportService } from './services/support-report.service';
import { MarketingReportService } from './services/marketing-report.service';
import { DashboardService } from './services/dashboard.service';
import { SavedReportService } from './services/saved-report.service';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminSavedReportController } from './controllers/admin-saved-report.controller';

import { AdminUser } from '../admin/entities/admin-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardSnapshot,
      ReportExecutionLog,
      SavedReport,
      AdminUser,
    ]),
  ],
  controllers: [
    AdminReportsController,
    AdminDashboardController,
    AdminSavedReportController,
  ],
  providers: [
    SalesReportService,
    RevenueReportService,
    ProductReportService,
    CustomerReportService,
    InventoryReportService,
    ReturnReportService,
    SupportReportService,
    MarketingReportService,
    DashboardService,
    SavedReportService,
  ],
})
export class ReportsBusinessIntelligenceModule {}
