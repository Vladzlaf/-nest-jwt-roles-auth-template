import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthDto, RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@libs/security/decorators/public.decorator';
import { FirebaseAuthGuard } from '@libs/security/guards/firebase-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP code for authentication' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    await this.authService.requestOtp(dto.email);
    return { message: 'OTP sent successfully' };
  }


  @Public()
  @Post('admin/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code for admin' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtpAdmin(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtpAdmin(dto.email, dto.code);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code and authenticate' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Public()
  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Firebase (Google/Apple)' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
  })
  async firebaseAuth(@Body() dto: FirebaseAuthDto) {
    return this.authService.authenticateWithFirebase(dto.idToken);
  }


  @Public()
  @Post('admin/firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Firebase (Google/Apple) for admin' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async firebaseAuthAdmin(@Body() dto: FirebaseAuthDto) {
    return this.authService.authenticateWithFirebaseAdmin(dto.idToken);
  }
  

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body('userId') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Refresh token successful' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.userId, dto.refreshToken);
  }

  @Public()
  @Post('admin/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token for admin' })
  @ApiResponse({ status: 200, description: 'Refresh token successful' })
  async refreshTokenAdmin(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokensAdmin(dto.userId, dto.refreshToken);
  }
}