import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Item } from './@types/item.entity.js';
import { AppService } from './app.service.js';

@Controller('items')
export class AppController {
  constructor(private readonly _service: AppService) {}

  @Post('name')
  create(@Body('name', ParseIntPipe) name: string) {
    const result = this._service.create(name);
    return result;
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    const result = this._service.getById(id);
    return result;
  }

  @Get()
  getAll(): Item[] {
    return this._service.getAll();
  }
}
