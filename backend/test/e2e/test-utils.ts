import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { AppConfigService } from '../../src/config/app-config.service';
import { AllExceptionsFilter } from '../../src/common/filters';
import {
  LoggingInterceptor,
  TransformInterceptor,
  TimeoutInterceptor,
} from '../../src/common/interceptors';
import { Logger } from 'nestjs-pino';

export async function createTestingApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  app.setGlobalPrefix('api');

  const configService = app.get(AppConfigService);
  app.enableCors({
    origin: configService.isDevelopment
      ? true
      : process.env.ALLOWED_ORIGINS?.split(',') || false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.init();
  return app;
}

export async function shutdownTestingApp(app: INestApplication) {
  if (app) {
    const prisma = app.get(PrismaService);
    await prisma.$disconnect();
    await app.close();
  }
}
