import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyMobileDto } from './dto/verify-mobile.dto';
import { ResendMobileOtpDto } from './dto/resend-mobile-otp.dto';
import { VerifyEmailProfileDto } from './dto/verify-email-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipAuditLog } from '../../common/decorators/skip-audit-log.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Customer Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account (Requires Mobile)' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful. SMS OTP sent to mobile number.',
  })
  @ApiResponse({ status: 400, description: 'Email or mobile already taken.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-mobile')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verify customer mobile number with SMS OTP — returns tokens (auto-login)',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile verified. Access and refresh tokens returned.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  async verifyMobile(@Body() dto: VerifyMobileDto, @Req() req: Request) {
    return this.authService.verifyMobile(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('resend-mobile-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiOperation({ summary: 'Resend SMS OTP for mobile verification' })
  @ApiResponse({ status: 200, description: 'SMS OTP resent successfully.' })
  @ApiResponse({ status: 400, description: 'Mobile already verified or cooldown active.' })
  async resendMobileOtp(@Body() dto: ResendMobileOtpDto) {
    return this.authService.resendMobileOtp(dto);
  }

  @SkipAuditLog()
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Customer login — returns access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 403, description: 'Mobile verification required (returns maskedMobile).' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip, req.headers['user-agent']);
  }

  @SkipAuditLog()
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh customer access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshToken(
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @SkipAuditLog()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer logout' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  async logout(@CurrentUser() user: User, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(user.id, dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset SMS OTP via registered email' })
  @ApiResponse({
    status: 200,
    description: 'SMS OTP sent to user registered mobile if account exists.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset customer password using SMS OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiOperation({ summary: 'Request email verification OTP for customer profile' })
  @ApiResponse({ status: 200, description: 'Verification OTP sent to user email.' })
  async sendEmailVerification(@CurrentUser() user: User) {
    return this.authService.sendEmailVerification(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify customer email address with OTP' })
  @ApiResponse({ status: 200, description: 'Email address verified successfully.' })
  async verifyEmailProfile(
    @CurrentUser() user: User,
    @Body() dto: VerifyEmailProfileDto,
  ) {
    return this.authService.verifyEmailProfile(user.id, dto.otp);
  }
}
