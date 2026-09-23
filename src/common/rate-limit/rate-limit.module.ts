import { Global, Module } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard.js';
import { RedisRateLimiter } from './redis-rate-limiter.service.js';

@Global()
@Module({
  providers: [RedisRateLimiter, RateLimitGuard],
  exports: [RedisRateLimiter, RateLimitGuard],
})
export class RateLimitModule {}
