import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  RegisterResponseDto,
  AuthTokensDto,
  LogoutDto,
  LogoutResponseDto,
} from './auth.dto';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and obtain JWT tokens' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Standard login',
        value: {
          email: 'admin@opshub.com',
          password: 'SecurePass123!',
        },
      },
    },
  })
  @ApiOkResponse({
    type: AuthTokensDto,
    description: 'Access and refresh tokens issued for the authenticated user',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.authService.login(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account and issue tokens' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Create standard user',
        value: {
          email: 'new.user@opshub.com',
          username: 'newuser',
          password: 'SecurePass123!',
          firstName: 'New',
          lastName: 'User',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: RegisterResponseDto,
    description: 'User created successfully with issued tokens',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({ description: 'Email or username already exists' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    try {
      const user = await this.authService.createUser({
        email: registerDto.email,
        username: registerDto.username,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role || Role.USER,
      });

      const tokens = this.authService.login(user);

      return {
        user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const metaTarget = error.meta?.target;
        const field =
          Array.isArray(metaTarget) && typeof metaTarget[0] === 'string'
            ? metaTarget[0]
            : 'field';
        throw new ConflictException(`This ${field} is already taken`);
      }
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      default: {
        summary: 'Refresh tokens',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
    type: AuthTokensDto,
    description: 'Newly issued access and refresh tokens',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthTokensDto> {
    const tokens = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out the current user (client-side token revocation)',
  })
  @ApiBody({
    type: LogoutDto,
    examples: {
      default: {
        summary: 'Logout payload',
        value: {
          userId: 'clskh1f0a000008ma9tf0x1s2',
        },
      },
    },
  })
  @ApiOkResponse({
    type: LogoutResponseDto,
    description: 'Confirmation message acknowledging logout',
  })
  logout(@Body() body: LogoutDto): LogoutResponseDto {
    this.authService.logout(body.userId);
    return { message: 'Logged out successfully' };
  }
}
