import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AnalyticsService } from './analytics.service.js';

type AuthenticatedRequest = Request & { user: { sub: string } };

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.analyticsService.getUserAnalytics(request.user.sub);
  }
}
