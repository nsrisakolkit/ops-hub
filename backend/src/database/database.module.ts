import { Module, Global, DynamicModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Dynamic module to allow forRoot pattern if needed in the future
@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  }
}
