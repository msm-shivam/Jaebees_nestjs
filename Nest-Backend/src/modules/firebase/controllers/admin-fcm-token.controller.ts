import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { CurrentAdmin } from '../../../common/decorators/current-admin.decorator';
import { FcmTokenService } from '../fcm-token.service';
import { RegisterFcmTokenDto } from '../dto/register-fcm-token.dto';
import { FcmUserType } from '../entities/fcm-token.entity';

@ApiTags('Admin — FCM Tokens')
@Controller('admin/fcm-tokens')
export class AdminFcmTokenController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}

  @Post()
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Register or update admin FCM device token' })
  async register(@CurrentAdmin() admin: any, @Body() dto: RegisterFcmTokenDto) {
    return this.fcmTokenService.register(
      admin.sub,
      FcmUserType.ADMIN,
      dto.token,
      dto.deviceInfo,
    );
  }

  @Get()
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get my registered FCM tokens' })
  async myTokens(@CurrentAdmin() admin: any) {
    return this.fcmTokenService.findByUser(admin.sub, FcmUserType.ADMIN);
  }

  @Delete(':token')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remove a single FCM token' })
  async remove(@Param('token') token: string) {
    await this.fcmTokenService.remove(token);
    return { message: 'Token removed' };
  }

  @Delete()
  @ApiOperation({ summary: 'Remove all admin FCM tokens (public)' })
  async removeAll() {
    const count = await this.fcmTokenService.removeByUserType(FcmUserType.ADMIN);
    return { message: `${count} admin token(s) removed` };
  }
}
