import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard.js';
import { LinksService } from './links.service.js';

@Controller()
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':code')
  @UseGuards(RateLimitGuard)
  @RateLimit({ key: 'links:redirect', limit: 60, windowSeconds: 60 })
  async redirect(
    @Param('code') code: string,
    @Res() response: Response,
  ): Promise<void> {
    const link = await this.linksService.findByCode(code);
    await this.linksService.recordClick(link.id);
    response.redirect(302, link.original);
  }
}
