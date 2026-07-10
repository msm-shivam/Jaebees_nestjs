import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { firebaseConfig } from '../../config/firebase.config';
import { FirebaseService } from './firebase.service';
import { FcmTokenService } from './fcm-token.service';
import { FcmToken } from './entities/fcm-token.entity';
import { FcmTokenController } from './controllers/fcm-token.controller';
import { AdminFcmTokenController } from './controllers/admin-fcm-token.controller';
import { PushTestController } from './controllers/push-test.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(firebaseConfig),
    TypeOrmModule.forFeature([FcmToken]),
  ],
  controllers: [FcmTokenController, AdminFcmTokenController, PushTestController],
  providers: [FirebaseService, FcmTokenService],
  exports: [FirebaseService, FcmTokenService],
})
export class FirebaseModule {}
