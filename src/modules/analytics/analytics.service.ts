import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getStatus() {
    return { status: 'analytics-ready' };
  }
}
