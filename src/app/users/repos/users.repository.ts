import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        email,
        password,
      },
    });
  }

  async createUser(
    user: Pick<User, 'role' | 'email' | 'fullName'>,
  ): Promise<User> {
    return await this.prisma.user.create({
      data: {
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      },
    });
  }

  async updateRtHash(userId: string, refreshToken: string): Promise<User> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hashedRefreshToken,
      },
    });
  }

  async deleteRtHash(user: Pick<User, 'id'>): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedRt: null,
      },
    });
  }

  async logoutUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: null },
    });
  }
}
