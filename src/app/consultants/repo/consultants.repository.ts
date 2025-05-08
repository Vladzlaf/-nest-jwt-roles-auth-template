import { PrismaService } from "@libs/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Consultant } from "@prisma/client";
import * as argon2 from 'argon2';

@Injectable()
export class ConsultantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConsultantByEmail(email: string): Promise<Consultant | null> {
    return this.prisma.consultant.findUnique({
      where: { email },
    });
  }

  async findConsultantById(id: string): Promise<Consultant | null> {
    return this.prisma.consultant.findUnique({
      where: { id },
    });
  }

  async createConsultant(email: string, fullName: string): Promise<Consultant> {
    return this.prisma.consultant.create({
      data: { email, fullName },
    });
  }

  async updateConsultantRefreshToken(
    consultantId: string,
    refreshToken: string,
  ): Promise<Consultant> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    return this.prisma.consultant.update({
      where: { id: consultantId },
      data: { hashedRt: hashedRefreshToken },
    });
  }

  async logoutConsultant(consultantId: string): Promise<Consultant> {
    return this.prisma.consultant.update({
      where: { id: consultantId },
      data: { hashedRt: null },
    });
  }
}
