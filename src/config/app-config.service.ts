import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  NODE_ENV: string = 'development';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string = 'your-secret-key';

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string = 'your-refresh-secret-key';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  JWT_EXPIRATION_TIME?: number = 3600; // 1 hour

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  JWT_REFRESH_EXPIRATION_TIME?: number = 604800; // 7 days

  @IsString()
  @IsOptional()
  UPLOAD_PATH?: string = './uploads';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  MAX_FILE_SIZE?: number = 10485760; // 10MB
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', { infer: true })!;
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true })!;
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true })!;
  }

  get redisUrl(): string | undefined {
    return this.configService.get('REDIS_URL', { infer: true });
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true })!;
  }

  get jwtRefreshSecret(): string {
    return this.configService.get('JWT_REFRESH_SECRET', { infer: true })!;
  }

  get jwtExpirationTime(): number {
    return this.configService.get('JWT_EXPIRATION_TIME', { infer: true })!;
  }

  get jwtRefreshExpirationTime(): number {
    return this.configService.get('JWT_REFRESH_EXPIRATION_TIME', { infer: true })!;
  }

  get uploadPath(): string {
    return this.configService.get('UPLOAD_PATH', { infer: true })!;
  }

  get maxFileSize(): number {
    return this.configService.get('MAX_FILE_SIZE', { infer: true })!;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}