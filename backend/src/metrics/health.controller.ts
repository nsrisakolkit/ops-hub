import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../database';
import { Public } from '../common/decorators';

@Controller()
export class HealthController {
  // HealthCheckService and PrismaHealthIndicator come from TerminusModule
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get('health')
  // Use Public() decorator to skip auth for health checks
  @Public()
  // Decorator to structure health check response
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('health/ready')
  @Public()
  ready() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('health/live')
  @Public()
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
