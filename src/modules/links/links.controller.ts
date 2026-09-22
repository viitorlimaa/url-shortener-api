import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateLinkDto } from './dto/create-link.dto.js';
import { LinksService } from './links.service.js';

type AuthenticatedRequest = Request & { user: { sub: string } };

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: CreateLinkDto, @Req() request: AuthenticatedRequest) {
    return this.linksService.create(data, request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(@Req() request: AuthenticatedRequest) {
    return this.linksService.findByUser(request.user.sub);
  }

  @Get('health')
  health() {
    return { status: 'links-module-ok' };
  }
}
