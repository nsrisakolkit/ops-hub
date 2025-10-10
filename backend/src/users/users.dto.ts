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
import { Transform, TransformFnParams } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Role } from '@prisma/client'; // Import Role enum from Prisma schema

const lowerCaseTrim = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.toLowerCase().trim() : undefined;

const trimValue = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

const toBoolean = ({ value }: TransformFnParams): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
};

const toNumber = (
  { value }: TransformFnParams,
  options?: { min?: number; max?: number; defaultValue?: number },
): number | undefined => {
  const { min: minValue, max: maxValue, defaultValue } = options ?? {};
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  let bounded = parsed;
  if (minValue !== undefined) {
    bounded = Math.max(minValue, bounded);
  }
  if (maxValue !== undefined) {
    bounded = Math.min(maxValue, bounded);
  }

  return bounded;
};

export class CreateUserDto {
  @ApiProperty({
    example: 'alex.morgan@opshub.com',
    description: 'Unique email address for the new user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(lowerCaseTrim)
  email!: string;

  @ApiProperty({
    example: 'alexmorgan',
    minLength: 3,
    maxLength: 20,
    description: 'Unique username; letters, numbers, and underscores only',
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
    example: 'StrongPassw0rd!',
    minLength: 6,
    maxLength: 128,
    description: 'Plain text password; will be hashed before storing',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password!: string;

  @ApiPropertyOptional({
    example: 'Alex',
    description: 'Optional first name',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(trimValue)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Morgan',
    description: 'Optional last name',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(trimValue)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.opshub.com/avatars/alex.png',
    description: 'URL pointing to the user avatar',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @Transform(trimValue)
  avatar?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.USER,
    description: 'User role; defaults to USER',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the account is active',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'alexander.morgan@opshub.com',
    description: 'Updated email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(lowerCaseTrim)
  email?: string;

  @ApiPropertyOptional({
    example: 'alexander',
    minLength: 3,
    maxLength: 20,
    description: 'Updated username',
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @Transform(lowerCaseTrim)
  username?: string;

  @ApiPropertyOptional({ example: 'Alexander' })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(trimValue)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Morgan' })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(trimValue)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.opshub.com/avatars/alexander.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @Transform(trimValue)
  avatar?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.ADMIN,
    description: 'Updated role',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @ApiPropertyOptional({
    example: false,
    description: 'Updated active status',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}

export class UpdateOwnProfileDto {
  @ApiPropertyOptional({
    example: 'avery.chen@opshub.com',
    description: 'Updated email address; must remain unique',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(lowerCaseTrim)
  email?: string;

  @ApiPropertyOptional({
    example: 'Avery',
    description: 'Updated first name',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(trimValue)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Chen',
    description: 'Updated last name',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(trimValue)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.opshub.com/avatars/avery.png',
    description: 'Updated avatar URL',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @Transform(trimValue)
  avatar?: string;
}

// Query DTO for filtering users with enhanced validation
export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'alex',
    description:
      'Search term applied to email, username, first name, or last name',
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(1, { message: 'Search term cannot be empty' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  @Transform(trimValue)
  search?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.USER,
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status; accepts true/false',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @Transform(toBoolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Transform((params) => toNumber(params, { min: 1, defaultValue: 1 }))
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(1000, { message: 'Page must not exceed 1000' })
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of records per page',
  })
  @IsOptional()
  @Transform((params) =>
    toNumber(params, { min: 1, max: 100, defaultValue: 10 }),
  )
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit: number = 10;
}

// Response DTO for user data (excluding sensitive fields)
export class UserResponseDto {
  @ApiProperty({ example: 'clskh1f0a000008ma9tf0x1s2' })
  id!: string;

  @ApiProperty({ example: 'alex.morgan@opshub.com' })
  email!: string;

  @ApiProperty({ example: 'alexmorgan' })
  username!: string;

  @ApiPropertyOptional({ example: 'Alex', nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Morgan', nullable: true })
  lastName?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.opshub.com/avatars/alex.png',
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

// DTO for updating user status
export class UpdateUserStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive!: boolean;
}

// DTO for password updates
export class UpdatePasswordDto {
  @ApiProperty({
    example: 'CurrentPass123',
    description: 'Current password for verification',
  })
  @IsString()
  @MinLength(6, {
    message: 'Current password must be at least 6 characters long',
  })
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPass456!',
    description: 'New password to replace the current password',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @MaxLength(128, {
    message: 'New password must not exceed 128 characters',
  })
  newPassword!: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: UserResponseDto, isArray: true })
  data!: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class ProjectStatsDto {
  @ApiProperty({ example: 12 })
  tasks!: number;

  @ApiProperty({ example: 4 })
  members!: number;
}

export class ProjectSummaryDto {
  @ApiProperty({ example: 'clsproj123' })
  id!: string;

  @ApiProperty({ example: 'Website Redesign' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Complete overhaul of the marketing site',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: '2025-09-01T10:15:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-07T08:30:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: ProjectStatsDto })
  _count!: ProjectStatsDto;
}

export class UserProjectMembershipDto {
  @ApiProperty({ example: 'clsmember123' })
  id!: string;

  @ApiProperty({ example: 'OWNER' })
  role!: string;

  @ApiProperty({ example: '2025-09-01T10:15:00.000Z' })
  joinedAt!: Date;

  @ApiProperty({ example: 'clsproj123' })
  projectId!: string;

  @ApiProperty({ example: 'clskh1f0a000008ma9tf0x1s2' })
  userId!: string;

  @ApiProperty({ type: ProjectSummaryDto })
  project!: ProjectSummaryDto;
}

export class TaskProjectSummaryDto {
  @ApiProperty({ example: 'clsproj123' })
  id!: string;

  @ApiProperty({ example: 'Website Redesign' })
  name!: string;
}

export class TaskAssigneeSummaryDto {
  @ApiProperty({ example: 'clskh1f0a000008ma9tf0x1s2' })
  id!: string;

  @ApiProperty({ example: 'janedoe' })
  username!: string;

  @ApiPropertyOptional({ example: 'Jane', nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', nullable: true })
  lastName?: string | null;
}

export class UserTaskDto {
  @ApiProperty({ example: 'clstask123' })
  id!: string;

  @ApiProperty({ example: 'Design homepage hero section' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Create high-fidelity designs for the hero section',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: 'IN_PROGRESS' })
  status!: string;

  @ApiProperty({ example: 'HIGH' })
  priority!: string;

  @ApiPropertyOptional({ example: '2025-10-15T00:00:00.000Z', nullable: true })
  dueDate?: Date | null;

  @ApiProperty({ example: '2025-09-30T10:15:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-05T08:45:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: TaskProjectSummaryDto })
  project!: TaskProjectSummaryDto;

  @ApiPropertyOptional({ type: TaskAssigneeSummaryDto, nullable: true })
  assignee?: TaskAssigneeSummaryDto | null;
}
