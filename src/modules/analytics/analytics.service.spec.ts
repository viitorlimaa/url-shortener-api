import { PrismaService } from '../../prisma/prisma.service.js';
import { AnalyticsService } from './analytics.service.js';

describe('AnalyticsService', () => {
  it('aggregates real clicks by link and day', async () => {
    const prisma = {
      link: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'link-id',
            shortCode: 'abc12345',
            original: 'https://example.com',
          },
        ]),
      },
      click: {
        groupBy: vi.fn().mockResolvedValue([
          { linkId: 'link-id', _count: { _all: 3 } },
        ]),
        findMany: vi.fn().mockResolvedValue([
          { linkId: 'link-id', createdAt: new Date('2026-09-23T10:00:00Z') },
          { linkId: 'link-id', createdAt: new Date('2026-09-23T11:00:00Z') },
          { linkId: 'link-id', createdAt: new Date('2026-09-22T11:00:00Z') },
        ]),
      },
    } as unknown as PrismaService;
    const service = new AnalyticsService(prisma);

    await expect(service.getUserAnalytics('user-id')).resolves.toEqual([
      {
        shortCode: 'abc12345',
        original: 'https://example.com',
        totalClicks: 3,
        clicksByDay: [
          { date: '2026-09-22', clicks: 1 },
          { date: '2026-09-23', clicks: 2 },
        ],
      },
    ]);
  });
});
