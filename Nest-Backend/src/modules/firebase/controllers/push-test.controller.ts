import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseService } from '../firebase.service';
import { FcmTokenService } from '../fcm-token.service';
import { FcmUserType } from '../entities/fcm-token.entity';
import { TestPushDto } from '../dto/test-push.dto';

@ApiTags('Notifications — Test')
@Controller('notifications')
export class PushTestController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly fcmTokenService: FcmTokenService,
  ) {}

  @Post('test-push')
  @ApiOperation({ summary: 'Send a test push notification (no auth required)' })
  async testPush(@Body() dto: TestPushDto) {
    const { token, userType, userId, title, body, data } = dto;
    const payload = { title, body, data };

    if (token) {
      const result = await this.firebaseService.sendPush(token, payload);
      return { message: 'Push sent', success: !!result, messageId: result };
    }

    if (userId && userType) {
      await this.firebaseService.sendPushToUser(userId, userType as FcmUserType, payload);
      return { message: `Push sent to ${userType} ${userId}` };
    }

    if (userType === 'admin') {
      await this.firebaseService.sendPushToAllAdmins(payload);
      return { message: 'Push sent to all admins' };
    }

    if (userType === 'customer') {
      const allTokens = await this.fcmTokenService.findAllByUserType(FcmUserType.CUSTOMER);
      const tokens = allTokens.map((t) => t.token);
      if (tokens.length === 0) return { message: 'No customer tokens registered' };
      await this.firebaseService.sendMulticast(tokens, payload);
      return { message: `Push sent to ${tokens.length} customer device(s)` };
    }

    return { message: 'No target specified (provide token, userId+userType, or userType)' };
  }
}
