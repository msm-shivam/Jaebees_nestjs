import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { UsersService } from './users.service';
import { AdminCustomerQueryDto } from './dto/admin-customer-query.dto';
import { AppValidationPipe } from '../../common/pipes/validation.pipe';

@ApiTags('Admin — Customers')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(DefaultPermissions.CUSTOMER_VIEW)
  @ApiOperation({ summary: 'List all customers with search, filters, and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by first name' })
  @ApiQuery({ name: 'isActive', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'isEmailVerified', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter by registration date (start)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter by registration date (end)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'firstName', 'lastName', 'email'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of customers' })
  @ApiResponse({ status: 403, description: 'Forbidden — missing customer.view permission' })
  async findAll(@Query(AppValidationPipe) query: AdminCustomerQueryDto) {
    return this.usersService.findAllCustomers(query);
  }

  @Get('stats')
  @Permissions(DefaultPermissions.CUSTOMER_STATS)
  @ApiOperation({ summary: 'Get customer stats (total, active, verified, new this month, new today)' })
  @ApiResponse({ status: 200, description: 'Customer statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden — missing customer.stats permission' })
  async getStats() {
    return this.usersService.getCustomerStats();
  }
}
