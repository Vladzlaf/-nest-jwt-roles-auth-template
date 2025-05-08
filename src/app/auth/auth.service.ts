import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '@libs/otp/otp.service';
import { FirebaseService } from '@libs/firebase/firebase.service';
import { Role } from '@prisma/client';
import { UsersRepository } from '@app/users/repos/users.repository';
import { ConsultantRepository } from '@app/consultants/repo/consultants.repository';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private firebaseService: FirebaseService,
    private userRepository: UsersRepository,
    private consultantRepository: ConsultantRepository,
  ) {}

  async requestOtp(email: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);
    await this.otpService.generateOtp(email, user?.id);
  }

  async verifyOtpAdmin(email: string, code: string) {
    const isValid = await this.otpService.verifyOtp(email, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let consultant = await this.consultantRepository.findConsultantByEmail(email);

    if (!consultant) {
      consultant = await this.consultantRepository.createConsultant(email, email.split('@')[0]);
    }

    const tokens = await this.getTokens(consultant.id, consultant.email, consultant.role);
    await this.consultantRepository.updateConsultantRefreshToken(consultant.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: consultant.id,
        email: consultant.email,
        fullName: consultant.fullName,
        role: Role.CONSULTANT,
      },
    };
  }

  async verifyOtp(email: string, code: string) {
    const isValid = await this.otpService.verifyOtp(email, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      user = await this.userRepository.createUser({
        email,
        fullName: email.split('@')[0],
        role: Role.CONSULTANT,

      });
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.userRepository.updateRtHash(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async authenticateWithFirebaseAdmin(idToken: string) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);

      const { email, name } = decodedToken;

      if (!email) {
        throw new UnauthorizedException('Firebase token does not contain an email');
      }

      let consultant = await this.consultantRepository.findConsultantByEmail(email);

      if (!consultant) {
        let fullName = '';
        if (name) {
          const nameParts = name.split(' ');
          fullName = (nameParts[0] || '') + ' ' + (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
        } else {
          fullName = email.split('@')[0];
        }

        consultant = await this.consultantRepository.createConsultant(email, fullName);
      }

      const tokens = await this.getTokens(consultant.id, consultant.email, consultant.role);
      await this.consultantRepository.updateConsultantRefreshToken(consultant.id, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: consultant.id,
          email: consultant.email,
          fullName: consultant.fullName,
          role: consultant.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async authenticateWithFirebase(idToken: string) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);

      const { email, name } = decodedToken;

      if (!email) {
        throw new UnauthorizedException(
          'Firebase token does not contain an email',
        );
      }

      let user = await this.userRepository.findUserByEmail(email);

      if (!user) {
        let fullName = '';

        if (name) {
          const nameParts = name.split(' ');
          fullName = (nameParts[0] || '') + ' ' + (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
        } else {
          fullName = email.split('@')[0];
        }

        user = await this.userRepository.createUser({
          email,
          fullName,
          role: Role.CLIENT,
        });
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.userRepository.updateRtHash(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async refreshTokensAdmin(userId: string, refreshToken: string) {
    const consultant = await this.consultantRepository.findConsultantById(userId);

    if (!consultant || !consultant.hashedRt) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await argon2.verify(consultant.hashedRt, refreshToken);
    if (!refreshTokenMatches) throw new UnauthorizedException('Access denied');

    const tokens = await this.getTokens(consultant.id, consultant.email, consultant.role);
    await this.consultantRepository.updateConsultantRefreshToken(consultant.id, tokens.refreshToken);

    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOneById(userId);

    if (!user || !user.hashedRt) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await argon2.verify(user.hashedRt, refreshToken);
    if (!refreshTokenMatches) throw new UnauthorizedException('Access denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.userRepository.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.userRepository.logoutUser(userId);
  }

  async logoutConsultant(consultantId: string) {
    await this.consultantRepository.logoutConsultant(consultantId);
  }

  private async getTokens(userId: string, email: string, role: Role) {
    const jwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('security.atSecret'),
        expiresIn: this.configService.get<string>('security.atExpiresIn'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('security.rtSecret'),
        expiresIn: this.configService.get<string>('security.rtExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
