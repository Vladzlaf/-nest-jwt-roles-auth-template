import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@libs/prisma/prisma.service';
import { SendgridService } from '@libs/sendgrid/sendgrid.service';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private sendgridService: SendgridService,
  ) {}

  async generateOtp(email: string, userId?: string): Promise<string> {
    const length = this.configService.get<number>('otp.length');
    const expiryMinutes = this.configService.get<number>('otp.expiryMinutes');

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = randomInt(min, max).toString().padStart(length, '0');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    await this.prisma.otp.create({
      data: {
        code: otp,
        email,
        expiresAt,
        userId,
      },
    });

    await this.sendgridService.sendOtpEmail(email, otp);

    return otp;
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const now = new Date();

    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return false;
    }

    await this.prisma.otp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        isUsed: true,
      },
    });

    return true;
  }

  async invalidateOtps(email: string): Promise<void> {
    await this.prisma.otp.updateMany({
      where: {
        email,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });
  }
}
