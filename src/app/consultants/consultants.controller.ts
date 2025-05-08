import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import { ConsultantesService } from "./consultants.service";
import { Request as ExpressRequest } from 'express';
import { UpdateEmailDto } from "./dto/update-email.dto";
import { AuthService } from "@app/auth/auth.service";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UpdateConsultantsDto } from "./dto/update-consultants.dto";
interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('consultant')
export class ConsultantController {
  constructor(
    private readonly consultantService: ConsultantesService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get the current consultant' })
  @ApiResponse({ status: 200, description: 'The current consultant' })
  @ApiBearerAuth()
  @Get('')
  async findMe(@Req() req: AuthenticatedRequest) {
    return this.consultantService.findMe(req.user.userId);
  }

  @ApiOperation({ summary: 'Get all consultants' })
  @ApiResponse({ status: 200, description: 'All consultants' })
  @ApiBearerAuth()
  @Get('all')
  async findAll() {
    return this.consultantService.findAll();
  }

  @ApiOperation({ summary: 'Request OTP for email update' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiBearerAuth()
  @Put('update/email')
  async updateEmail(@Body() body: UpdateEmailDto) {
    await this.authService.requestOtp(body.email);
    return { message: 'OTP sent successfully' };
  }

  @ApiOperation({ summary: 'Verify email update OTP' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiBearerAuth()
  @Put('update/email/verify')
  async verifyEmail(
    @Req() req: AuthenticatedRequest,
    @Body() body: VerifyEmailDto,
  ) {
    return this.consultantService.updateEmail(
      req.user.userId,
      body.email,
      body.code,
    );
  }

  @ApiOperation({ summary: 'Update the consultant' })
  @ApiResponse({ status: 200, description: 'Consultant updated successfully' })
  @ApiBearerAuth()
  @Put('update')
  async update(@Req() req: AuthenticatedRequest, @Body() body: UpdateConsultantsDto) {
    return this.consultantService.updateConsultant(req.user.userId, body);
  }
}
