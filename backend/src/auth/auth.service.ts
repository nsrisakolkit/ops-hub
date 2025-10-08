import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database';
import { AppConfigService } from '../config';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isActive) {
      // In a real app, you'd hash and compare passwords
      // For now, we'll skip password validation
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<AuthTokens> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.jwtExpirationTime,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpirationTime,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a real app, you might want to blacklist the token
    // For now, we'll just log the logout
    console.log(`User ${userId} logged out`);
  }
}