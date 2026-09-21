import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { NotificationService } from '../notifications/notification.service.js';

const OTP_TTL_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp(): string {
  return Math.floor(Math.random() * 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, '0');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly notifications: NotificationService,
  ) {}

  private issueTokens(user: { id: string; role: string }) {
    const accessToken = this.jwt.sign({ sub: user.id, role: user.role });
    return { accessToken };
  }

  async registerWithEmail(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.createWithEmail(email, passwordHash);
    return { user: this.sanitize(user), ...this.issueTokens(user) };
  }

  async loginWithEmail(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return { user: this.sanitize(user), ...this.issueTokens(user) };
  }

  async requestPhoneOtp(phone: string, purpose: 'REGISTER' | 'LOGIN') {
    const user = await this.users.findOrCreateByPhone(phone);
    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        target: phone,
        codeHash,
        purpose,
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      },
    });
    await this.notifications.sendOtpSms(phone, code);
    return { message: 'OTP sent.' };
  }

  async verifyPhoneOtp(phone: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { target: phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired or not found. Request a new one.');
    }
    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      throw new UnauthorizedException('Incorrect OTP.');
    }
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    const user = await this.users.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('Account not found for this phone number.');
    }
    if (!user.isPhoneVerified) {
      await this.users.markPhoneVerified(user.id);
    }
    return { user: this.sanitize(user), ...this.issueTokens(user) };
  }

  async requestPasswordReset(email: string) {
    const user = await this.users.findByEmail(email);
    if (user) {
      const code = generateOtp();
      const codeHash = await bcrypt.hash(code, 10);
      await this.prisma.otpCode.create({
        data: {
          userId: user.id,
          target: email,
          codeHash,
          purpose: 'PASSWORD_RESET',
          expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
        },
      });
      await this.notifications.sendPasswordResetEmail(email, code);
    }
    // Always respond the same way so we don't leak whether the email is registered.
    return { message: 'If that email is registered, a reset code has been sent.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { target: email, purpose: 'PASSWORD_RESET', consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset code expired or not found.');
    }
    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      throw new UnauthorizedException('Incorrect reset code.');
    }
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Account not found.');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.users.updatePassword(user.id, passwordHash);
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    return { message: 'Password updated successfully.' };
  }

  private sanitize(user: { id: string; email: string | null; phone: string | null; role: string }) {
    return { id: user.id, email: user.email, phone: user.phone, role: user.role };
  }
}
