import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // =========================
  // LOGIN
  // =========================

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findUserForLogin(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
      ),
      expiresIn: '7d',
    });

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      10,
    );

    // Store hashed refresh token
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      hashedRefreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // =========================
  // REFRESH TOKEN
  // =========================

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is required',
      );
    }

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
        ),
      });

      // Find user and include refresh token hash
      const user =
        await this.usersService.findUserWithRefreshToken(
          payload.sub,
        );

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      // Compare provided token with stored hash
      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      const newPayload = {
        sub: user._id.toString(),
        email: user.email,
      };

      // Generate new access token
      const newAccessToken = this.jwtService.sign(
        newPayload,
        {
          secret: this.configService.get<string>(
            'JWT_SECRET',
          ),
          expiresIn: '15m',
        },
      );

      // Generate new refresh token
      const newRefreshToken = this.jwtService.sign(
        newPayload,
        {
          secret: this.configService.get<string>(
            'JWT_REFRESH_SECRET',
          ),
          expiresIn: '7d',
        },
      );

      // Hash new refresh token
      const hashedNewRefreshToken = await bcrypt.hash(
        newRefreshToken,
        10,
      );

      // Replace old refresh token hash
      await this.usersService.updateRefreshToken(
        user._id.toString(),
        hashedNewRefreshToken,
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }
  }

  // =========================
  // LOGOUT
  // =========================

  async logout(userId: string) {
    // Remove stored refresh token
    await this.usersService.updateRefreshToken(
      userId,
      null,
    );

    return {
      message: 'Logout successful',
    };
  }

  async getCurrentUser(userId: string) {
  const user = await this.usersService.findUserById(userId);

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
}
}