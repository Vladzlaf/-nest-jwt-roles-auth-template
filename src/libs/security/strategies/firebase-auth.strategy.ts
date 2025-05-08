import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FirebaseService } from '@libs/firebase/firebase.service';
import { PrismaService } from '@libs/prisma/prisma.service';
import { Role } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase',
) {
  constructor(
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async validate(request: Request): Promise<any> {
    const idToken = this.extractTokenFromHeader(request);
    if (!idToken) {
      throw new UnauthorizedException('No Firebase ID token provided');
    }

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);

      const { email, name, uid: firebaseUid, picture } = decodedToken;

      if (!email) {
        throw new UnauthorizedException(
          'Firebase token does not contain an email',
        );
      }

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: name || email.split('@')[0],
            role: Role.CONSULTANT,
          },
        });
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
