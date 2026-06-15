import {
  Controller,
  Get,
  Post,
  Body,
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
import { PrivacyRequestService } from '../services/privacy-request.service';
import type { ProcessPrivacyRequestDto } from '../dto/process-privacy-request.dto';

@ApiTags('Admin — Privacy')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/privacy')
export class AdminPrivacyController {
  constructor(private readonly privacyRequestService: PrivacyRequestService) {}

  @Get('requests')
  @Permissions(DefaultPermissions.PRIVACY_MANAGE)
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.privacyRequestService.findAll(page, limit);
  }

  @Get('requests/:id')
  @Permissions(DefaultPermissions.PRIVACY_MANAGE)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.privacyRequestService.findOne(id);
  }

  @Post('requests/:id/process')
  @Permissions(DefaultPermissions.PRIVACY_MANAGE)
  async process(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessPrivacyRequestDto,
  ) {
    return this.privacyRequestService.process(id, dto);
  }
}
