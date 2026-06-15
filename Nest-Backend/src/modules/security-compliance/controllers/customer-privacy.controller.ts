import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { PrivacyRequestService } from '../services/privacy-request.service';
import { PrivacyRequestType } from '../enums/privacy-request-type.enum';

@ApiTags('Customer — Privacy')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('privacy')
export class CustomerPrivacyController {
  constructor(private readonly privacyRequestService: PrivacyRequestService) {}

  @Post('export-data')
  async exportData(@CurrentUser() user: JwtPayload) {
    return this.privacyRequestService.create(
      user.sub,
      PrivacyRequestType.EXPORT_DATA,
    );
  }

  @Post('delete-account')
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.privacyRequestService.create(
      user.sub,
      PrivacyRequestType.DELETE_ACCOUNT,
    );
  }

  @Get('requests')
  async myRequests(@CurrentUser() user: JwtPayload) {
    return this.privacyRequestService.findByUser(user.sub);
  }
}
