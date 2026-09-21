import { Injectable, Logger } from '@nestjs/common';

/**
 * Dev-mode notification sender. Swap the internals for Amazon SES (email)
 * and Amazon SNS (SMS) when AWS credentials are available — the call sites
 * in AuthService don't need to change.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendOtpEmail(email: string, code: string) {
    this.logger.log(`[DEV EMAIL OTP] To: ${email} | Code: ${code}`);
  }

  async sendOtpSms(phone: string, code: string) {
    this.logger.log(`[DEV SMS OTP] To: ${phone} | Code: ${code}`);
  }

  async sendPasswordResetEmail(email: string, code: string) {
    this.logger.log(`[DEV PASSWORD RESET] To: ${email} | Code: ${code}`);
  }
}
