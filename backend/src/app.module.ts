import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modules
import { AppConfigModule } from './config';
import { DatabaseModule } from './database';

// Feature modules
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { ProjectsModule } from './projects';
import { TasksModule } from './tasks';
import { MetricsModule } from './metrics';

// Common
import {
  RequestLoggerMiddleware,
  RequestIdMiddleware,
} from './common/middleware';
import { LoggingModule } from './logging/logging.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Core modules
    AppConfigModule,
    DatabaseModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,
            limit: 3,
          },
          {
            name: 'medium', 
            ttl: 60000,
            limit: 20,
          },
        ],
        // storage: // Use your Redis instance if needed
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    MetricsModule,
    LoggingModule,
    CacheModule.forRootAsync(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  // configure applies middleware that runs before controllers and guards (before expensive operations)
  // Applies to ALL routes in your entire app
  // RequestIdMiddleware - Generates a unique ID for each request (for tracing/correlation)
  // RequestLoggerMiddleware - Logs incoming requests and responses
  // forRoutes('*') - Applies to all routes; for specific routes use .forRoutes('path/*')
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
