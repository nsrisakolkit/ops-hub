import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor, TimeoutInterceptor } from './common/interceptors';
import { AppConfigService } from './config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {

  // Logs are held in memory until you set up your custom logger, then they're all released at once.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Set up custom logger
  // Get Pino logger from DI container
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(AppConfigService);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
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

  const port = configService.port;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`🏥 Health check available at: http://localhost:${port}/health`);
  logger.log(`📊 Metrics available at: http://localhost:${port}/metrics`);
}

bootstrap();
