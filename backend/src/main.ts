import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor, TimeoutInterceptor } from './common/interceptors';
import { AppConfigService } from './config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  // Logs are held in memory until you set up your custom logger, then they're all released at once.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Set up custom logger
  // Get Pino logger from DI container
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Centralized configuration service
  // Provides access to environment variables and app settings
  const configService = app.get(AppConfigService);

  // Global pipes
  // ValidationPipe: automatically validates incoming requests based on DTOs
  // Activate all class-based validation decorators (e.g., @IsString, @IsInt)
  // whitelist: true - strips properties that do not have any decorators
  // forbidNonWhitelisted: true - throws an error if non-decorated properties are present
  // transform: true - automatically transforms payloads to be objects typed according to their DTO classes
  // e.g., if age is defined as number in DTO, it will be converted from string to number
  // This ensures type safety in your controllers and services
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global filters
  // global error handler that catches all unhandled exceptions throughout your entire application and formats them into consistent error responses.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),  // log html requests and responses
    new TransformInterceptor(),  // standardize response format
    new TimeoutInterceptor(),  // timeout long requests
  );

  // Security middleware
  app.use(helmet());

  // CORS
  // Allow requests from any origin in development, restrict in production
  app.enableCors({
    origin: configService.isDevelopment 
      ? true 
      : process.env.ALLOWED_ORIGINS?.split(',') || false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global prefix
  // Apply 'api' prefix to all routes except /health and /metrics
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/metrics'],
  });

  const config = new DocumentBuilder()
    .setTitle('OpsHub API')
    .setDescription('REST + GraphQL backend with Prisma, Redis, BullMQ')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc); 

  const port = configService.port;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`🏥 Health check available at: http://localhost:${port}/health`);
  logger.log(`📊 Metrics available at: http://localhost:${port}/metrics`);
}

bootstrap();
