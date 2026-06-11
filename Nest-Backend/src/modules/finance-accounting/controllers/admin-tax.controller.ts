import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { TaxService } from '../services/tax.service';

@ApiTags('Admin — Tax Reports')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/tax')
export class AdminTaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('summary')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getSummary(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.taxService.getSummary(dateFrom, dateTo);
  }

  @Get('reports')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async getReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('taxType') taxType?: string,
  ) {
    return this.taxService.getReports({ page, limit, dateFrom, dateTo, taxType });
  }
}
