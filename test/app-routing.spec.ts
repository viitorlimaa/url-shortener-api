import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { RedisRateLimiter } from '../src/common/rate-limit/redis-rate-limiter.service.js';

describe('App routing', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisRateLimiter)
      .useValue({
        onModuleInit: vi.fn(),
        onModuleDestroy: vi.fn(),
        consume: vi.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('routes /api/analytics to the analytics controller before the generic redirect route', async () => {
    const response = await request(app.getHttpServer()).get('/api/analytics');

    expect(response.status).not.toBe(404);
    expect(response.status).toBe(401);
  });
});
