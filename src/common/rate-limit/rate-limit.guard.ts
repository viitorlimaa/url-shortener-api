import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
    RATE_LIMIT_KEY,
    type RateLimitOptions,
} from './rate-limit.decorator.js';
import { RedisRateLimiter } from './redis-rate-limiter.service.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: RedisRateLimiter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const clientIp = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const result = await this.limiter.consume(
      `rate-limit:${options.key}:${clientIp}`,
      options.limit,
      options.windowSeconds,
    );

    response.setHeader('X-RateLimit-Limit', options.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('Retry-After', result.retryAfterSeconds);

    if (!result.allowed) {
      throw new HttpException(
        'Limite de requisições excedido. Tente novamente mais tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
