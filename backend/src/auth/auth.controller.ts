import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =========================
  // LOGIN
  // =========================

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate a user and set access and refresh tokens as HTTP-only cookies.',
  })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
    };
  }

  // =========================
  // REFRESH
  // =========================

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh authentication tokens',
    description:
      'Use the refresh token stored in the HTTP-only cookie to generate a new access token and refresh token.',
  })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, or missing refresh token',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      (request as any).cookies?.refresh_token;

    const result =
      await this.authService.refreshToken(refreshToken);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Tokens refreshed successfully',
    };
  }

  // =========================
  // LOGOUT
  // =========================

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logout the authenticated user, clear authentication cookies, and invalidate the stored refresh token.',
  })
  @ApiOkResponse({
    description: 'Logout successful',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  async logout(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userId = request.user.userId;

    await this.authService.logout(userId);

    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      message: 'Logout successful',
    };
  }

  @Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Get current authenticated user',
})
@ApiOkResponse({
  description: 'Current user returned successfully',
})
@ApiUnauthorizedResponse({
  description: 'Authentication required',
})
async getMe(@Req() request: Request) {
  const user = request.user as {
    userId: string;
    email: string;
  };

  return this.authService.getCurrentUser(user.userId);
}
}