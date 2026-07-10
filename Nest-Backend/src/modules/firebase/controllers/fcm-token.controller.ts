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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FcmTokenService } from '../fcm-token.service';
import { RegisterFcmTokenDto } from '../dto/register-fcm-token.dto';
import { FcmUserType } from '../entities/fcm-token.entity';

@ApiTags('FCM Tokens')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('fcm-tokens')
export class FcmTokenController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}

  @Post()
  @ApiOperation({ summary: 'Register or update FCM device token' })
  async register(
    @CurrentUser() user: any,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    return this.fcmTokenService.register(
      user.id || user.sub,
      FcmUserType.CUSTOMER,
      dto.token,
      dto.deviceInfo,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get my registered FCM tokens' })
  async myTokens(@CurrentUser() user: any) {
    return this.fcmTokenService.findByUser(
      user.id || user.sub,
      FcmUserType.CUSTOMER,
    );
  }

  @Delete(':token')
  @ApiOperation({ summary: 'Remove a single FCM token' })
  async remove(@Param('token') token: string) {
    await this.fcmTokenService.remove(token);
    return { message: 'Token removed' };
  }

  @Delete()
  @ApiOperation({ summary: 'Remove all my FCM tokens' })
  async removeAll(@CurrentUser() user: any) {
    const count = await this.fcmTokenService.removeByUser(
      user.id || user.sub,
      FcmUserType.CUSTOMER,
    );
    return { message: `${count} token(s) removed` };
  }
}
