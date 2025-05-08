import { OtpService } from "@libs/otp/otp.service";
import { PrismaService } from "@libs/prisma/prisma.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UpdateConsultantsDto } from "./dto/update-consultants.dto";
@Injectable()
export class ConsultantesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async findAll() {
    return this.prisma.consultant.findMany();
  }

  async findMe(id: string) {
    const consultant = await this.prisma.consultant.findUnique({ where: { id } });
    if (!consultant) {
      throw new NotFoundException('consultant not found');
    }
    return consultant;
  }

  async updateEmail(id: string, email: string, code: string) {
    const isValid = await this.otpService.verifyOtp(email, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const consultant = await this.prisma.consultant.findUnique({ where: { id } });

    if (!consultant) {
      throw new NotFoundException('consultant not found');
    }
    return this.prisma.consultant.update({ where: { id }, data: { email } });
  }

  async updateConsultant(id: string, data: UpdateConsultantsDto) {
    const consultant = await this.prisma.consultant.findUnique({ where: { id } });

    if (!consultant) {
      throw new NotFoundException('consultant not found');
    }

    return this.prisma.consultant.update({ where: { id }, data });
  }
}
