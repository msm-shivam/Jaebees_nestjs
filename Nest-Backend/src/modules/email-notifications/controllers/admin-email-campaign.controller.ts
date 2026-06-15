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
import { EmailCampaignService } from '../services/email-campaign.service';
import type { CreateEmailCampaignDto } from '../dto/create-email-campaign.dto';
import type { UpdateEmailCampaignDto } from '../dto/update-email-campaign.dto';

@ApiTags('Admin — Email Campaigns')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/email-campaigns')
export class AdminEmailCampaignController {
  constructor(private readonly campaignService: EmailCampaignService) {}

  @Post()
  @Permissions(DefaultPermissions.CAMPAIGN_MANAGE)
  async create(@Body() dto: CreateEmailCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.CAMPAIGN_VIEW)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.campaignService.findAll({ page, limit, status, type });
  }

  @Get(':id')
  @Permissions(DefaultPermissions.CAMPAIGN_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.CAMPAIGN_MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmailCampaignDto,
  ) {
    return this.campaignService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.CAMPAIGN_MANAGE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.campaignService.remove(id);
    return { message: 'Campaign deleted' };
  }
}
