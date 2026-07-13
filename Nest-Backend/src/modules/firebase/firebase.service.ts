import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { initializeApp, cert, getApps, ServiceAccount } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import type { Message, MulticastMessage, BatchResponse } from 'firebase-admin/messaging';
import { firebaseConfig } from '../../config/firebase.config';
import { FcmTokenService } from './fcm-token.service';
import { FcmUserType } from './entities/fcm-token.entity';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private messaging: ReturnType<typeof getMessaging> | null = null;

  constructor(
    @Inject(firebaseConfig.KEY)
    private readonly fbConfig: ConfigType<typeof firebaseConfig>,
    private readonly fcmTokenService: FcmTokenService,
  ) {}

  onModuleInit() {
    try {
      if (!fs.existsSync(this.fbConfig.serviceAccountPath)) {
        this.logger.warn(
          `Firebase service account not found at ${this.fbConfig.serviceAccountPath} – push disabled`,
        );
        return;
      }

      const serviceAccount: ServiceAccount = JSON.parse(
        fs.readFileSync(this.fbConfig.serviceAccountPath, 'utf-8'),
      );

      if (getApps().length === 0) {
        initializeApp({ credential: cert(serviceAccount) });
      }
      this.messaging = getMessaging();
      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error(
        `Firebase init failed: ${(error as Error).message}`,
      );
    }
  }

  async sendPush(
    token: string,
    payload: { title: string; body: string; data?: Record<string, string> },
  ): Promise<string | null> {
    if (!this.messaging) return null;
    try {
      const message: Message = {
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      };
      return await this.messaging.send(message);
    } catch (error) {
      this.logger.error(`Push send failed: ${(error as Error).message}`);
      return null;
    }
  }

  async sendMulticast(
    tokens: string[],
    payload: { title: string; body: string; data?: Record<string, string> },
  ): Promise<BatchResponse | null> {
    if (!this.messaging) {
      this.logger.warn('Firebase messaging not initialized — push skipped');
      return null;
    }
    try {
      const message: MulticastMessage = {
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      };
      const response = await this.messaging.sendEachForMulticast(message);
      this.logger.log(`Multicast sent: ${response.successCount}/${tokens.length} succeeded`);
      await this.cleanupInvalidTokens(response, tokens);
      return response;
    } catch (error) {
      this.logger.error(`Multicast failed: ${(error as Error).message}`);
      return null;
    }
  }

  async sendPushToUser(
    userId: string,
    userType: FcmUserType,
    payload: { title: string; body: string; data?: Record<string, string> },
  ): Promise<void> {
    const tokens = await this.fcmTokenService.findByUser(userId, userType);
    if (tokens.length === 0) {
      this.logger.warn(`No FCM tokens for ${userType} ${userId} — push skipped`);
      return;
    }
    await this.sendMulticast(
      tokens.map((t) => t.token),
      payload,
    );
  }

  async sendPushToAllAdmins(
    payload: { title: string; body: string; data?: Record<string, string> },
  ): Promise<void> {
    if (!this.messaging) {
      this.logger.warn('Firebase messaging not initialized — push to admins skipped');
      return;
    }
    const tokens = await this.fcmTokenService.findAllByUserType(FcmUserType.ADMIN);
    if (tokens.length === 0) {
      this.logger.warn('No admin FCM tokens registered — push skipped');
      return;
    }
    await this.sendMulticast(
      tokens.map((t) => t.token),
      payload,
    );
  }

  private async cleanupInvalidTokens(
    response: BatchResponse,
    tokens: string[],
  ): Promise<void> {
    if (!response.responses) return;
    const invalidErrors = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
    ];
    for (let i = 0; i < response.responses.length; i++) {
      const resp = response.responses[i];
      if (!resp.success && resp.error && invalidErrors.includes(resp.error.code)) {
        try {
          await this.fcmTokenService.remove(tokens[i]);
          this.logger.warn(`Removed invalid FCM token: ${tokens[i]}`);
        } catch {
          // ignore
        }
      }
    }
  }
}
