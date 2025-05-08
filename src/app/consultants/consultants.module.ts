import { Module } from '@nestjs/common';
import { ConsultantController } from './consultants.controller';
import { ConsultantesService } from './consultants.service';
import { PrismaService } from '@libs/prisma/prisma.service';
import { OtpModule } from '@libs/otp/otp.module';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [OtpModule, AuthModule], 
  controllers: [ConsultantController],
  providers: [ConsultantesService, PrismaService],
})
export class ConsultantsModule {}
