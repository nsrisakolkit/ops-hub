import { IsEmail, IsString, MinLength, IsOptional, MaxLength, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@prisma/client'


export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email!: string;

  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  username!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
