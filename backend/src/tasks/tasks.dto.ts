import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDate,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaskStatus, Priority } from '@prisma/client';

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
    message:
      'Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: Priority;

  @IsUUID(4, { message: 'Project ID must be a valid UUID' })
  projectId: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  assigneeId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Creator ID must be a valid UUID' })
  creatorId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dueDate?: Date;
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
    message:
      'Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: Priority;

  @IsOptional()
  @IsUUID(4, { message: 'Project ID must be a valid UUID' })
  projectId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  assigneeId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dueDate?: Date;
}

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message:
      'Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority?: Priority;

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
