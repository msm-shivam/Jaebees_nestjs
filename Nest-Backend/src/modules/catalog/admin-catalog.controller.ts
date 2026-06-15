import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CatalogService } from './catalog.service';

@ApiTags('Admin — Catalog')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('overview')
  @Permissions(DefaultPermissions.CATALOG_VIEW)
  async overview() {
    return this.catalogService.getOverview();
  }

  @Get('summary')
  @Permissions(DefaultPermissions.CATALOG_VIEW)
  async summary() {
    return this.catalogService.getSummary();
  }

  @Get('quick-links')
  @Permissions(DefaultPermissions.CATALOG_VIEW)
  async quickLinks() {
    return this.catalogService.getQuickLinks();
  }

  @Get('analytics')
  @Permissions(DefaultPermissions.CATALOG_MANAGE)
  async analytics(@CurrentUser() user: JwtPayload) {
    return this.catalogService.getAnalytics(user.sub);
  }
}
