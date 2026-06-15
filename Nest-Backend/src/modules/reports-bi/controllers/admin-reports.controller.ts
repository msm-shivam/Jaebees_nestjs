import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SalesReportService } from '../services/sales-report.service';
import { RevenueReportService } from '../services/revenue-report.service';
import { ProductReportService } from '../services/product-report.service';
import { CustomerReportService } from '../services/customer-report.service';
import { InventoryReportService } from '../services/inventory-report.service';
import { ReturnReportService } from '../services/return-report.service';
import { SupportReportService } from '../services/support-report.service';
import { MarketingReportService } from '../services/marketing-report.service';

@ApiTags('Admin — Reports')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(
    private readonly salesReportService: SalesReportService,
    private readonly revenueReportService: RevenueReportService,
    private readonly productReportService: ProductReportService,
    private readonly customerReportService: CustomerReportService,
    private readonly inventoryReportService: InventoryReportService,
    private readonly returnReportService: ReturnReportService,
    private readonly supportReportService: SupportReportService,
    private readonly marketingReportService: MarketingReportService,
  ) {}

  @Get('sales')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async sales(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.salesReportService.getReport(dateFrom, dateTo);
  }

  @Get('revenue')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async revenue(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.revenueReportService.getReport(dateFrom, dateTo);
  }

  @Get('products')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async products(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.productReportService.getReport(dateFrom, dateTo);
  }

  @Get('categories')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async categories(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.productReportService.getByCategory(dateFrom, dateTo);
  }

  @Get('brands')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async brands(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.productReportService.getByBrand(dateFrom, dateTo);
  }

  @Get('customers')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async customers(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.customerReportService.getReport(dateFrom, dateTo);
  }

  @Get('inventory')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async inventory(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.inventoryReportService.getReport(dateFrom, dateTo);
  }

  @Get('returns')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async returns(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.returnReportService.getReport(dateFrom, dateTo);
  }

  @Get('support')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async support(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.supportReportService.getReport(dateFrom, dateTo);
  }

  @Get('marketing')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async marketing(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.marketingReportService.getReport(dateFrom, dateTo);
  }
}
