import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CampaignService } from '../services/campaign.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { CampaignQueryDto } from '../dto/campaign-query.dto';

@ApiTags('Admin Campaigns')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @Permissions(DefaultPermissions.CAMPAIGN_CREATE)
  @ApiOperation({ summary: 'Create a campaign' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.CAMPAIGN_VIEW)
  @ApiOperation({ summary: 'List all campaigns' })
  findAll(@Query() query: CampaignQueryDto) {
    return this.campaignService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.CAMPAIGN_VIEW)
  @ApiOperation({ summary: 'Get campaign by ID' })
  findById(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.CAMPAIGN_UPDATE)
  @ApiOperation({ summary: 'Update a campaign' })
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.CAMPAIGN_DELETE)
  @ApiOperation({ summary: 'Delete a campaign' })
  remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}
