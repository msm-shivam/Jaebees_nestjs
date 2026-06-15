import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SearchAnalyticsService } from '../services/search-analytics.service';
import { SearchAnalyticsQueryDto } from '../dto/search-analytics-query.dto';

@ApiTags('Admin - Search')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/search')
export class AdminSearchController {
  constructor(
    private readonly searchAnalyticsService: SearchAnalyticsService,
  ) {}

  @Get('analytics')
  @Permissions(DefaultPermissions.SEARCH_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get search analytics overview' })
  async analytics(@Query() query: SearchAnalyticsQueryDto) {
    return this.searchAnalyticsService.getAnalytics(query.period || '30d');
  }

  @Get('summary')
  @Permissions(DefaultPermissions.SEARCH_ANALYTICS_VIEW)
  @ApiOperation({
    summary:
      'Get analytics summary (searchCount, CTR, conversionRate, avgPosition)',
  })
  async summary(@Query() query: SearchAnalyticsQueryDto) {
    return this.searchAnalyticsService.getAnalyticsSummary(
      query.period || '30d',
    );
  }

  @Get('top-keywords')
  @Permissions(DefaultPermissions.SEARCH_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get top search keywords' })
  async topKeywords(@Query() query: SearchAnalyticsQueryDto) {
    return this.searchAnalyticsService.getTopKeywords(
      query.period || '30d',
      query.limit,
    );
  }

  @Get('trending')
  @Permissions(DefaultPermissions.SEARCH_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get trending keywords' })
  async trending(@Query() query: SearchAnalyticsQueryDto) {
    return this.searchAnalyticsService.getTrendingKeywords(query.limit);
  }

  @Get('no-results')
  @Permissions(DefaultPermissions.SEARCH_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get searches with no results' })
  async noResults(@Query() query: SearchAnalyticsQueryDto) {
    return this.searchAnalyticsService.getNoResultKeywords(
      query.period || '30d',
      query.limit,
    );
  }

  @Delete('cache')
  @Permissions(DefaultPermissions.SEARCH_ANALYTICS_MANAGE)
  @ApiOperation({ summary: 'Clear search cache' })
  async clearCache() {
    await this.searchAnalyticsService.clearCache();
    return { message: 'Search cache cleared' };
  }
}
