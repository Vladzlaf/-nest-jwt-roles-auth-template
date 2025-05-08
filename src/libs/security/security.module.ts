import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseAuthStrategy } from './strategies/firebase-auth.strategy';
import { FirebaseModule } from '@libs/firebase/firebase.module';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    FirebaseModule,
    PrismaModule,
    ConfigModule,
    JwtModule.register({}),
  ],
  providers: [FirebaseAuthStrategy, JwtStrategy],
  exports: [PassportModule],
})
export class SecurityModule {}
