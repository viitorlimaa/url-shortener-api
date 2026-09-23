import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LinksController } from './links.controller.js';
import { LinksService } from './links.service.js';
import { RedirectController } from './redirect.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [LinksController, RedirectController],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}
