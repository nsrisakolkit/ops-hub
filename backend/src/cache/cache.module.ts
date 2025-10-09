import { CacheModule as NestCache } from '@nestjs/cache-manager';
import { Module, DynamicModule } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { AppConfigService, AppConfigModule } from '../config';

@Module({})
export class CacheModule {
  static forRootAsync(): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        NestCache.registerAsync({
          useFactory: async (configService: AppConfigService) => {
            const redisUrl = configService.redisUrl;
            
            if (redisUrl) {
              // Use Redis if URL is available
              return {
                store: await redisStore({ url: redisUrl }),
                ttl: 10_000, // ms
              };
            } else {
              // Fall back to in-memory cache
              return {
                ttl: 10_000, // ms
              };
            }
          },
          inject: [AppConfigService],
          isGlobal: true,
        }),
      ],
    };
  }

  static forRoot(url: string): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        NestCache.registerAsync({
          useFactory: async () => ({
            store: await redisStore({ url }),
            ttl: 10_000, // ms
          }),
          isGlobal: true,
        }),
      ],
    };
  }
}
