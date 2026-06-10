import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { EmailTemplateService } from '../email-template.service';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@ApiTags('Admin - Email Templates')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/email-templates')
export class AdminEmailTemplatesController {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @Post()
  @Permissions(DefaultPermissions.EMAIL_TEMPLATE_CREATE)
  @ApiOperation({ summary: 'Create email template' })
  create(@Body() dto: CreateEmailTemplateDto) {
    return this.emailTemplateService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.EMAIL_TEMPLATE_VIEW)
  @ApiOperation({ summary: 'List all email templates' })
  findAll() {
    return this.emailTemplateService.findAll();
  }

  @Get(':id')
  @Permissions(DefaultPermissions.EMAIL_TEMPLATE_VIEW)
  @ApiOperation({ summary: 'Get email template by id' })
  findById(@Param('id') id: string) {
    return this.emailTemplateService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.EMAIL_TEMPLATE_UPDATE)
  @ApiOperation({ summary: 'Update email template' })
  update(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    return this.emailTemplateService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.EMAIL_TEMPLATE_DELETE)
  @ApiOperation({ summary: 'Delete email template' })
  remove(@Param('id') id: string) {
    return this.emailTemplateService.remove(id);
  }
}
