import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { OtpModule } from '@libs/otp/otp.module';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from '@libs/firebase/firebase.module';
import { UsersRepository } from '@app/users/repos/users.repository';
import { ConsultantRepository } from '@app/consultants/repo/consultants.repository';

@Module({
  imports: [PrismaModule, OtpModule, JwtModule, FirebaseModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, ConsultantRepository],
  exports: [AuthService],
})
export class AuthModule {}
