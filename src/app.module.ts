import { Module } from '@nestjs/common';
import { UsersModule } from '@app/users/users.module';
import { AuthModule } from '@app/auth/auth.module';
import { SecurityModule } from '@libs/security/security.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config_i18n from 'configs/i18n.config';
import config_app from 'configs/app.config';
import config_security from 'configs/security.config';
import config_firebase from 'configs/firebase.config';
import config_sendgrid from 'configs/sendgrid.config';
import config_otp from 'configs/otp.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { FirebaseModule } from '@libs/firebase/firebase.module';
import { SendgridModule } from '@libs/sendgrid/sendgrid.module';
import { OtpModule } from '@libs/otp/otp.module';
import { AccessTokenGuard } from '@libs/security/guards/access-token.guard';
import { ConsultantsModule } from '@app/consultants/consultants.module';

@Module({
  imports: [
    UsersModule,
    ConsultantsModule,
    AuthModule,
    SecurityModule,
    PrismaModule,
    FirebaseModule,
    SendgridModule,
    OtpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [
        config_i18n,
        config_app,
        config_security,
        config_firebase,
        config_sendgrid,
        config_otp,
      ],
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      useFactory: (config: ConfigService) => config.get('i18n'),
    }),
    JwtModule.register({}),
    
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AccessTokenGuard }],
})
export class AppModule {}
