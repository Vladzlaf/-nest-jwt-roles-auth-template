import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { SendgridModule } from '@libs/sendgrid/sendgrid.module';

@Module({
  imports: [PrismaModule, SendgridModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
