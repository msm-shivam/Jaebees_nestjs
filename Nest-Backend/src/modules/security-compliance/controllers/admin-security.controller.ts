import {
  Controller,
  Get,
  Post,
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
import { SecurityService } from '../services/security.service';
import { SessionService } from '../services/session.service';
import type { SecurityEventQueryDto } from '../dto/security-event-query.dto';

@ApiTags('Admin — Security')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/security')
export class AdminSecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('events')
  @Permissions(DefaultPermissions.SECURITY_VIEW)
  async findEvents(@Query() query: SecurityEventQueryDto) {
    return this.securityService.findEvents(query);
  }

  @Get('login-activities')
  @Permissions(DefaultPermissions.SECURITY_VIEW)
  async findLoginActivities(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.securityService.findLoginActivities({
      status,
      userId,
      dateFrom,
      dateTo,
      page,
      limit,
    });
  }

  @Get('sessions')
  @Permissions(DefaultPermissions.SECURITY_VIEW)
  async findSessions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sessionService.findAll(page, limit);
  }

  @Post('sessions/:id/revoke')
  @Permissions(DefaultPermissions.SECURITY_MANAGE)
  async revokeSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.revoke(id);
  }
}
