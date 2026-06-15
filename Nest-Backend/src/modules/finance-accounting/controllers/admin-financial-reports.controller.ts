import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { FinancialReportService } from '../services/financial-report.service';

@ApiTags('Admin — Financial Reports')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/financial-reports')
export class AdminFinancialReportsController {
  constructor(private readonly reportService: FinancialReportService) {}

  @Get('profit-loss')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getProfitLoss(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getProfitLoss(dateFrom, dateTo);
  }

  @Get('revenue')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getRevenue(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getRevenueReport(dateFrom, dateTo);
  }

  @Get('expenses')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getExpenses(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getExpenseReport(dateFrom, dateTo);
  }

  @Get('settlements')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getSettlements(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getSettlementReport(dateFrom, dateTo);
  }

  @Get('dashboard')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getDashboard() {
    return this.reportService.getDashboard();
  }
}
