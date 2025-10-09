import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDate,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID(4, { message: 'Project ID must be a valid UUID' })
  projectId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  assigneeId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Creator ID must be a valid UUID' })
  creatorId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dueDate?: Date;

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
  @IsNumber({}, { message: 'Estimated hours must be a number' })
  @Min(0.1, { message: 'Estimated hours must be at least 0.1' })
  @Max(1000, { message: 'Estimated hours must not exceed 1000' })
  estimatedHours?: number;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID(4, { message: 'Project ID must be a valid UUID' })
  projectId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  assigneeId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dueDate?: Date;

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
  @IsNumber({}, { message: 'Estimated hours must be a number' })
  @Min(0.1, { message: 'Estimated hours must be at least 0.1' })
  @Max(1000, { message: 'Estimated hours must not exceed 1000' })
  estimatedHours?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Actual hours must be a number' })
  @Min(0, { message: 'Actual hours must be at least 0' })
  @Max(1000, { message: 'Actual hours must not exceed 1000' })
  actualHours?: number;
}

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID(4, { message: 'Project ID must be a valid UUID' })
  projectId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  assigneeId?: string;

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(1, { message: 'Search term cannot be empty' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  search?: string;

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
}

export class TaskCommentDto {
  @IsString({ message: 'Comment must be a string' })
  @MinLength(1, { message: 'Comment cannot be empty' })
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  content: string;
}

export class TaskAttachmentDto {
  @IsString({ message: 'Filename must be a string' })
  @MinLength(1, { message: 'Filename cannot be empty' })
  @MaxLength(255, { message: 'Filename must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  filename: string;

  @IsString({ message: 'File URL must be a string' })
  @MinLength(1, { message: 'File URL cannot be empty' })
  @Transform(({ value }) => value?.trim())
  fileUrl: string;

  @IsOptional()
  @IsNumber({}, { message: 'File size must be a number' })
  @Min(1, { message: 'File size must be at least 1 byte' })
  @Max(100 * 1024 * 1024, { message: 'File size must not exceed 100MB' })
  fileSize?: number;

  @IsOptional()
  @IsString({ message: 'MIME type must be a string' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  mimeType?: string;
}
