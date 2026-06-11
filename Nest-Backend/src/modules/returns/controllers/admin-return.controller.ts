import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import type { ReturnQueryDto } from '../dto/return-query.dto';
import type { SchedulePickupDto } from '../dto/schedule-pickup.dto';
import type { ProcessRefundDto } from '../dto/process-refund.dto';
import type { RejectReturnDto } from '../dto/reject-return.dto';
import { ReturnService } from '../services/return.service';

@ApiTags('Admin — Returns')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/returns')
export class AdminReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Get()
  @Permissions(DefaultPermissions.RETURN_VIEW)
  async findAll(@Query() query: ReturnQueryDto) {
    return this.returnService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.RETURN_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnService.findOne(id);
  }

  @Post(':id/approve')
  @Permissions(DefaultPermissions.RETURN_APPROVE)
  async approve(@CurrentUser() admin: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.returnService.approve(id, admin.sub);
  }

  @Post(':id/reject')
  @Permissions(DefaultPermissions.RETURN_REJECT)
  async reject(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectReturnDto,
  ) {
    return this.returnService.reject(id, admin.sub, dto);
  }

  @Post(':id/schedule-pickup')
  @Permissions(DefaultPermissions.RETURN_APPROVE)
  async schedulePickup(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SchedulePickupDto,
  ) {
    return this.returnService.schedulePickup(id, admin.sub, dto);
  }

  @Post(':id/received')
  @Permissions(DefaultPermissions.RETURN_RECEIVE)
  async markReceived(@CurrentUser() admin: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.returnService.markReceived(id, admin.sub);
  }

  @Post(':id/refund')
  @Permissions(DefaultPermissions.RETURN_REFUND)
  async refund(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessRefundDto,
  ) {
    return this.returnService.processRefund(id, admin.sub, dto);
  }

  @Post(':id/complete')
  @Permissions(DefaultPermissions.RETURN_APPROVE)
  async complete(@CurrentUser() admin: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.returnService.complete(id, admin.sub);
  }
}
