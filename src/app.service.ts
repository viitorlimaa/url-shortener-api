import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Record<string, string> {
    return {
      status: 'ok',
      name: 'url-shortener-api',
      message: 'API initialized successfully',
    };
  }
}
