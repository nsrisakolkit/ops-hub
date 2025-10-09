import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { RequestLoggerMiddleware, RequestIdMiddleware } from './common/middleware';
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { LoggingModule } from './logging/logging.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Core modules
    AppConfigModule,
    DatabaseModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    MetricsModule,
    LoggingModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
