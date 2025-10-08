import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService, validate } from './app-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      // The .env.local file provides environment-specific overrides and follows a common configuration hierarchy pattern. 
      // It is loaded first to allow local settings to override shared defaults in .env.
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}