import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

@ApiTags('Admin — Audit Logs')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/audit-logs')
export class AdminAuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Permissions(DefaultPermissions.AUDIT_VIEW)
  async findAll(@Query() query: AuditLogQueryDto) {
    if (query.module && !query.entityType) {
      query.entityType = query.module;
    }
    return this.auditLogService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.AUDIT_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogService.findOne(id);
  }

  @Get('entity/:entityType/:entityId')
  @Permissions(DefaultPermissions.AUDIT_VIEW)
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.auditLogService.findByEntity(entityType, entityId);
  }
}
