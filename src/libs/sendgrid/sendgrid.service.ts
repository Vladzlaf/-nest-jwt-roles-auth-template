import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendgridService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    sgMail.setApiKey(apiKey);
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const fromEmail = this.configService.get<string>('sendgrid.fromEmail');
    const fromName = this.configService.get<string>('sendgrid.fromName');

    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: 'Your Authentication Code',
      text: `Your OTP code is: ${otp}. It will expire in ${this.configService.get<number>('otp.expiryMinutes')} minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Authentication Code</h2>
          <p>Your one-time password (OTP) is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This code will expire in ${this.configService.get<number>('otp.expiryMinutes')} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid Error:', error);
      return false;
    }
  }
}
