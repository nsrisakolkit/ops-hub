import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database';
import { AppConfigService } from '../config';
import { Role, User } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type SanitizedUser = Omit<User, 'password'>;

interface CreateAuthUserInput {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

interface RefreshTokenPayload {
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SanitizedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isActive) {
      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Remove password from the returned user object
        const sanitizedUser: SanitizedUser = this.stripPassword(user);
        return sanitizedUser;
      }
    }
    return null;
  }

  login(user: SanitizedUser): AuthTokens {
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
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.jwtRefreshSecret,
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const sanitizedUser = this.stripPassword(user);
      return this.login(sanitizedUser);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(userId: string): void {
    console.log(`User ${userId} logged out`);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async createUser(userData: CreateAuthUserInput): Promise<SanitizedUser> {
    const hashedPassword = await this.hashPassword(userData.password);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        email: userData.email.toLowerCase(),
        username: userData.username.toLowerCase(),
      },
    });

    return this.stripPassword(user);
  }

  private stripPassword(user: User): SanitizedUser {
    const { password, ...rest } = user;
    void password;
    return rest;
  }
}
