import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { Public } from '../../../common/decorators/public.decorator';
import { StoreSettingsService } from '../services/store-settings.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  UpdateStoreSettingsDto,
  UpdateSocialLinksDto,
  UpdateEmailConfigDto,
  UpdateBusinessInfoDto,
  UpdateSmtpConfigDto,
  TestSmtpDto,
} from '../dto/store-settings.dto';

@ApiTags('Admin — Store Settings')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/settings')
export class AdminStoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get('store')
  @Public()
  async getStoreSettings() {
    return this.storeSettingsService.getStoreSettings();
  }

  @Patch('store')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async updateStoreSettings(@Body() dto: UpdateStoreSettingsDto) {
    return this.storeSettingsService.updateStoreSettings(dto);
  }

  @Post('store/logo')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/store',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadLogo(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Logo file is required.');
    }
    const logoUrl = `/uploads/store/${file.filename}`;
    return this.storeSettingsService.updateLogo(logoUrl);
  }

  @Post('store/favicon')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  @UseInterceptors(
    FileInterceptor('favicon', {
      storage: diskStorage({
        destination: './uploads/store',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        favicon: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFavicon(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Favicon file is required.');
    }
    const faviconUrl = `/uploads/store/${file.filename}`;
    return this.storeSettingsService.updateFavicon(faviconUrl);
  }

  @Get('social-links')
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  async getSocialLinks() {
    return this.storeSettingsService.getSocialLinks();
  }

  @Patch('social-links')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async updateSocialLinks(@Body() dto: UpdateSocialLinksDto) {
    return this.storeSettingsService.updateSocialLinks(dto);
  }

  @Get('email')
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  async getEmailConfig() {
    return this.storeSettingsService.getEmailConfig();
  }

  @Patch('email')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async updateEmailConfig(@Body() dto: UpdateEmailConfigDto) {
    return this.storeSettingsService.updateEmailConfig(dto);
  }

  @Get('business')
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  async getBusinessInfo() {
    return this.storeSettingsService.getBusinessInfo();
  }

  @Patch('business')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async updateBusinessInfo(@Body() dto: UpdateBusinessInfoDto) {
    return this.storeSettingsService.updateBusinessInfo(dto);
  }

  @Get('email-smtp')
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  @ApiOperation({ summary: 'Get SMTP configuration' })
  async getSmtpConfig() {
    return this.storeSettingsService.getSmtpConfig();
  }

  @Patch('email-smtp')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  @ApiOperation({
    summary: 'Update SMTP configuration (hot-reloads transporter)',
  })
  async updateSmtpConfig(@Body() dto: UpdateSmtpConfigDto) {
    return this.storeSettingsService.updateSmtpConfig(dto);
  }

  @Post('email-smtp/test')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Test SMTP connection by sending a test email' })
  async testSmtp(@Body() dto: TestSmtpDto) {
    return this.storeSettingsService.testSmtpConnection(dto);
  }
}
