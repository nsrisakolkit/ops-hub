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
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get('health')
  @Public()
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
