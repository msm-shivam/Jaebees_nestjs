import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { FinanceService } from '../services/finance.service';
import { LedgerService } from '../services/ledger.service';
import type { CreateTransactionDto } from '../dto/create-transaction.dto';
import type { DateRangeDto } from '../dto/date-range.dto';

@ApiTags('Admin — Finance')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Get('transactions')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async findAllTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.financeService.findAll({ page, limit, type: type as any, dateFrom, dateTo });
  }

  @Get('transactions/:id')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async findTransaction(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findOne(id);
  }

  @Post('transactions')
  @Permissions(DefaultPermissions.FINANCE_MANAGE)
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return this.financeService.create(dto);
  }

  @Get('ledger')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async findAllLedger(@Query() query: DateRangeDto, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.ledgerService.findAll({ ...query, page, limit });
  }

  @Get('ledger/:accountCode')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async findLedgerByAccount(
    @Param('accountCode') accountCode: string,
    @Query() query: DateRangeDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ledgerService.findByAccount(accountCode, { ...query, page, limit });
  }
}
