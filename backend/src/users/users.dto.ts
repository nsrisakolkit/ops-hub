import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsUrl,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Define Role enum to match Prisma schema
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}


export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  username: string;

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
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  avatar?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role; // Changed from UserRole to Role (from Prisma)

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  username?: string;

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
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  avatar?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role; // Changed from UserRole to Role (from Prisma)

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}

// Query DTO for filtering users with enhanced validation
export class UserQueryDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(1, { message: 'Search term cannot be empty' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    const page = parseInt(value);
    return isNaN(page) ? 1 : Math.max(1, page);
  })
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(1000, { message: 'Page must not exceed 1000' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const limit = parseInt(value);
    return isNaN(limit) ? 10 : Math.min(Math.max(1, limit), 100);
  })
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;
}

// Response DTO for user data (excluding sensitive fields)
export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for updating user status
export class UpdateUserStatusDto {
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive: boolean;
}