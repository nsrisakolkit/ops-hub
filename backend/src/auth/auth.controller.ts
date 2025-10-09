import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service';
import { Public } from '../common/decorators';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.authService.validateUser(
      loginDto.email.toLowerCase(),
      loginDto.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this.authService.login(user);
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
