import { CacheModule as NestCache } from '@nestjs/cache-manager';
import { Module, DynamicModule } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';

@Module({})
export class CacheModule {
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
