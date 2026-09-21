import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterEmailDto } from './dto/register-email.dto.js';
import { LoginEmailDto } from './dto/login-email.dto.js';
import { RequestOtpDto } from './dto/request-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser, type AuthenticatedUser } from './decorators/current-user.decorator.js';
import { UsersService } from '../users/users.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('register/email')
  registerEmail(@Body() dto: RegisterEmailDto) {
    return this.auth.registerWithEmail(dto.email, dto.password);
  }

  @Post('login/email')
  loginEmail(@Body() dto: LoginEmailDto) {
    return this.auth.loginWithEmail(dto.email, dto.password);
  }

  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestPhoneOtp(dto.phone, dto.purpose);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyPhoneOtp(dto.phone, dto.code);
  }

  @Post('password/forgot')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.users.findById(currentUser.userId);
    if (!user) return null;
    return { id: user.id, email: user.email, phone: user.phone, role: user.role };
  }
}
