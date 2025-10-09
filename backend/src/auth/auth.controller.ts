import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service';
import { Public } from '../common/decorators';
import { LoginDto, RegisterDto, RefreshTokenDto } from './auth.dto';
import { Role } from '@prisma/client';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      const user = await this.authService.createUser({
        email: registerDto.email,
        username: registerDto.username,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role || Role.USER,
      });

      const tokens = await this.authService.login(user);

      return {
        user,
        tokens,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        const field = error.meta?.target?.[0] || 'field';
        throw new ConflictException(`This ${field} is already taken`);
      }
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { userId: string }): Promise<{ message: string }> {
    await this.authService.logout(body.userId);
    return { message: 'Logged out successfully' };
  }
}
