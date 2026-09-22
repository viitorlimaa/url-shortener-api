import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LinksService } from './links.service.js';

@Controller()
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Res() response: Response,
  ): Promise<void> {
    const link = await this.linksService.findByCode(code);
    response.redirect(302, link.original);
  }
}
