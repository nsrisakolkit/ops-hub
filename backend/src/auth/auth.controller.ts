import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service';
import { Public } from '../common/decorators';

export class LoginDto {
  email: string;
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

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
      throw new Error('Invalid credentials');
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