import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { Repository } from './app.repository.js';
import { AppService } from './app.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Repository],
})
export class AppModule {}
