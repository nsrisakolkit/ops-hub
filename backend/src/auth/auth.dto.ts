import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const lowerCaseTrim = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.toLowerCase().trim() : undefined;

const trimValue = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

export class LoginDto {
  @ApiProperty({
    example: 'admin@opshub.com',
    description: 'User email address used for authentication',
  })
  @IsEmail()
  @Transform(lowerCaseTrim)
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    minLength: 6,
    description: 'Account password',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'new.user@opshub.com',
    description: 'Unique email for the new account',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(lowerCaseTrim)
  email!: string;

  @ApiProperty({
    example: 'newuser',
    minLength: 3,
    maxLength: 20,
    description: 'Unique username (letters, numbers, underscores)',
  })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @Transform(lowerCaseTrim)
  username!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    minLength: 6,
    maxLength: 128,
    description: 'Strong password for the new account',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password!: string;

  @ApiPropertyOptional({
    example: 'New',
    description: 'User first name',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(trimValue)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'User',
    description: 'User last name',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(trimValue)
  lastName?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.USER,
    description: 'Optional role override',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Valid refresh token obtained during login',
  })
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

export class AuthTokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token used for authenticated requests',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token to obtain new access tokens',
  })
  refreshToken!: string;
}

export class AuthUserDto {
  @ApiProperty({ example: 'clskh1f0a000008ma9tf0x1s2' })
  id!: string;

  @ApiProperty({ example: 'new.user@opshub.com' })
  email!: string;

  @ApiProperty({ example: 'newuser' })
  username!: string;

  @ApiPropertyOptional({ example: 'New', nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'User', nullable: true })
  lastName?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatars/newuser.png',
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2025-10-09T07:44:02.519Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-09T07:44:02.519Z' })
  updatedAt!: Date;
}

export class RegisterResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}

export class LogoutDto {
  @ApiProperty({
    example: 'clskh1f0a000008ma9tf0x1s2',
    description: 'Identifier of the user initiating logout',
  })
  @IsString()
  @MinLength(1)
  userId!: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
