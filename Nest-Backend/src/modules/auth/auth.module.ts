import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { AdminSession } from '../admin/entities/admin-session.entity';
import { OtpVerification } from './entities/otp-verification.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { JwtCustomerStrategy } from './strategies/jwt-customer.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-customer' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('jwt.expiresIn') as never,
        },
      }),
    }),
    SecurityComplianceModule,
    TypeOrmModule.forFeature([
      User,
      UserSession,
      AdminUser,
      AdminSession,
      OtpVerification,
    ]),
  ],
  providers: [
    AuthService,
    AdminAuthService,
    JwtCustomerStrategy,
    JwtAdminStrategy,
  ],
  controllers: [AuthController, AdminAuthController],
  exports: [AuthService, AdminAuthService, JwtModule],
})
export class AuthModule {}
