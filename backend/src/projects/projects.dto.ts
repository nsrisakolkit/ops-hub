import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProjectStatus, ProjectRole } from '@prisma/client';

export class CreateProjectDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: `Status must be one of: ${Object.values(ProjectStatus).join(', ')}`,
  })
  status?: ProjectStatus;

  // Note: creatorId will be set by the controller from authenticated user
  @IsOptional()
  @IsUUID(4, { message: 'Creator ID must be a valid UUID' })
  creatorId?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: `Status must be one of: ${Object.values(ProjectStatus).join(', ')}`,
  })
  status?: ProjectStatus;
}

export class ProjectQueryDto {
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: `Status must be one of: ${Object.values(ProjectStatus).join(', ')}`,
  })
  status?: ProjectStatus;

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(1, { message: 'Search term cannot be empty' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 1 : Math.max(1, parsed);
  })
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 10 : Math.min(Math.max(1, parsed), 100);
  })
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @Transform(({ value }) => value?.trim())
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'Sort order must be either ASC or DESC',
  })
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// DTO for managing project members
export class ProjectMemberDto {
  @IsString({ message: 'User ID must be a string' })
  @MinLength(3, { message: 'User ID must be at least 3 characters long' })
  @MaxLength(40, { message: 'User ID must not exceed 40 characters' })
  @Transform(({ value }) => value?.trim())
  userId: string;

  @IsOptional()
  @IsEnum(ProjectRole, {
    message: `Role must be one of: ${Object.values(ProjectRole).join(', ')}`,
  })
  role?: ProjectRole = ProjectRole.MEMBER;
}

// DTO for updating project member role
export class UpdateProjectMemberDto {
  @IsEnum(ProjectRole, {
    message: `Role must be one of: ${Object.values(ProjectRole).join(', ')}`,
  })
  role: ProjectRole;
}

// Response DTOs
export class ProjectResponseDto {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectWithMembersDto extends ProjectResponseDto {
  members: {
    id: string;
    role: ProjectRole;
    joinedAt: Date;
    user: {
      id: string;
      username: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
  }[];
}

export class ProjectSummaryDto {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  memberCount: number;
  taskCount: number;
  createdAt: Date;
}
