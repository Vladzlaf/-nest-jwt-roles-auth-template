import { Controller, Get, Req, Put, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { Prisma } from '@prisma/client';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.usersService.getUser(userId);
  }

  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        gender: { type: 'string' },
      },
    },
  })
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Prisma.UserUpdateInput,
  ) {
    return this.usersService.updateUser(id, updateData);
  }
}
