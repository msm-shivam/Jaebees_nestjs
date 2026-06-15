import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { ExpenseService } from '../services/expense.service';
import type { CreateExpenseDto } from '../dto/create-expense.dto';
import type { UpdateExpenseDto } from '../dto/update-expense.dto';

@ApiTags('Admin — Expenses')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/expenses')
export class AdminExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @Permissions(DefaultPermissions.FINANCE_MANAGE)
  async create(
    @CurrentUser() admin: JwtPayload,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenseService.create(dto, admin.sub);
  }

  @Get()
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.expenseService.findAll({
      page,
      limit,
      category,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @Permissions(DefaultPermissions.FINANCE_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.FINANCE_MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.FINANCE_MANAGE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.expenseService.remove(id);
    return { message: 'Expense deleted' };
  }
}
