import { Controller, Get } from '@nestjs/common';

@Controller('links')
export class LinksController {
  @Get('health')
  health() {
    return { status: 'links-module-ok' };
  }
}
