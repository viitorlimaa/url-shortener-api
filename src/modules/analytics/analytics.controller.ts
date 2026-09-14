import { Controller, Get } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  @Get('health')
  health() {
    return { status: 'analytics-module-ok' };
  }
}
