import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDate,
  IsUrl,
  IsArray,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ProjectVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEAM = 'TEAM',
}

export class CreateProjectDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: 'Status must be one of: PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED, ARCHIVED',
  })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL',
  })
  priority?: ProjectPriority;

  @IsOptional()
  @IsEnum(ProjectVisibility, {
    message: 'Visibility must be one of: PUBLIC, PRIVATE, TEAM',
  })
  visibility?: ProjectVisibility;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Budget must be a number' })
  @Min(0, { message: 'Budget must be at least 0' })
  @Max(10000000, { message: 'Budget must not exceed 10,000,000' })
  budget?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MinLength(3, { message: 'Currency must be at least 3 characters (e.g., USD)' })
  @MaxLength(3, { message: 'Currency must be exactly 3 characters (e.g., USD)' })
  @Transform(({ value }) => value?.toUpperCase())
  currency?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Owner ID must be a valid UUID' })
  ownerId?: string;

  @IsOptional()
  @IsArray({ message: 'Team member IDs must be an array' })
  @IsUUID(4, { each: true, message: 'Each team member ID must be a valid UUID' })
  teamMemberIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  @Transform(({ value }) => 
    Array.isArray(value) 
      ? value.map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : tag)
      : value
  )
  tags?: string[];

  @IsOptional()
  @IsUrl({}, { message: 'Repository URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  repositoryUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Documentation URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  documentationUrl?: string;

  @IsOptional()
  @IsString({ message: 'Client name must be a string' })
  @MaxLength(100, { message: 'Client name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  clientName?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  department?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Estimated hours must be a number' })
  @Min(1, { message: 'Estimated hours must be at least 1' })
  @Max(100000, { message: 'Estimated hours must not exceed 100,000' })
  estimatedHours?: number;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: 'Status must be one of: PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED, ARCHIVED',
  })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL',
  })
  priority?: ProjectPriority;

  @IsOptional()
  @IsEnum(ProjectVisibility, {
    message: 'Visibility must be one of: PUBLIC, PRIVATE, TEAM',
  })
  visibility?: ProjectVisibility;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Budget must be a number' })
  @Min(0, { message: 'Budget must be at least 0' })
  @Max(10000000, { message: 'Budget must not exceed 10,000,000' })
  budget?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MinLength(3, { message: 'Currency must be at least 3 characters (e.g., USD)' })
  @MaxLength(3, { message: 'Currency must be exactly 3 characters (e.g., USD)' })
  @Transform(({ value }) => value?.toUpperCase())
  currency?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Owner ID must be a valid UUID' })
  ownerId?: string;

  @IsOptional()
  @IsArray({ message: 'Team member IDs must be an array' })
  @IsUUID(4, { each: true, message: 'Each team member ID must be a valid UUID' })
  teamMemberIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  @Transform(({ value }) => 
    Array.isArray(value) 
      ? value.map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : tag)
      : value
  )
  tags?: string[];

  @IsOptional()
  @IsUrl({}, { message: 'Repository URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  repositoryUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Documentation URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  documentationUrl?: string;

  @IsOptional()
  @IsString({ message: 'Client name must be a string' })
  @MaxLength(100, { message: 'Client name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  clientName?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  department?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Estimated hours must be a number' })
  @Min(1, { message: 'Estimated hours must be at least 1' })
  @Max(100000, { message: 'Estimated hours must not exceed 100,000' })
  estimatedHours?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Actual hours must be a number' })
  @Min(0, { message: 'Actual hours must be at least 0' })
  @Max(100000, { message: 'Actual hours must not exceed 100,000' })
  actualHours?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Progress percentage must be a number' })
  @Min(0, { message: 'Progress must be at least 0%' })
  @Max(100, { message: 'Progress must not exceed 100%' })
  progressPercentage?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is archived must be a boolean' })
  isArchived?: boolean;
}

export class ProjectQueryDto {
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: 'Status must be one of: PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED, ARCHIVED',
  })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL',
  })
  priority?: ProjectPriority;

  @IsOptional()
  @IsEnum(ProjectVisibility, {
    message: 'Visibility must be one of: PUBLIC, PRIVATE, TEAM',
  })
  visibility?: ProjectVisibility;

  @IsOptional()
  @IsUUID(4, { message: 'Owner ID must be a valid UUID' })
  ownerId?: string;

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(1, { message: 'Search term cannot be empty' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString({ message: 'Tag must be a string' })
  @MaxLength(50, { message: 'Tag must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  tag?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  department?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @Transform(({ value }) => value?.trim())
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'Sort order must be either ASC or DESC',
  })
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsBoolean({ message: 'Include archived must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  includeArchived?: boolean;
}

export class ProjectMemberDto {
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  @MaxLength(50, { message: 'Role must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  role?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Hourly rate must be a number' })
  @Min(0, { message: 'Hourly rate must be at least 0' })
  @Max(10000, { message: 'Hourly rate must not exceed 10,000' })
  hourlyRate?: number;
}

export class ProjectTimelogDto {
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description cannot be empty' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsNumber({}, { message: 'Hours must be a number' })
  @Min(0.1, { message: 'Hours must be at least 0.1' })
  @Max(24, { message: 'Hours must not exceed 24 per entry' })
  hours: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  date?: Date;

  @IsOptional()
  @IsUUID(4, { message: 'Task ID must be a valid UUID' })
  taskId?: string;
}
