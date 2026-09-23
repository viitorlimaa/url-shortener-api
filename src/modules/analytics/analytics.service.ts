import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAnalytics(userId: string) {
    const links = await this.prisma.link.findMany({
      where: { userId },
      select: { id: true, shortCode: true, original: true },
      orderBy: { createdAt: 'desc' },
    });

    if (links.length === 0) return [];

    const linkIds = links.map((link) => link.id);
    const [totals, clicks] = await Promise.all([
      this.prisma.click.groupBy({
        by: ['linkId'],
        where: { linkId: { in: linkIds } },
        _count: { _all: true },
      }),
      this.prisma.click.findMany({
        where: { linkId: { in: linkIds } },
        select: { linkId: true, createdAt: true },
      }),
    ]);

    const totalByLink = new Map(
      totals.map((total) => [total.linkId, total._count._all]),
    );
    const dailyByLink = new Map<string, Map<string, number>>();

    for (const click of clicks) {
      const daily = dailyByLink.get(click.linkId) ?? new Map<string, number>();
      const date = click.createdAt.toISOString().slice(0, 10);
      daily.set(date, (daily.get(date) ?? 0) + 1);
      dailyByLink.set(click.linkId, daily);
    }

    return links.map((link) => ({
      shortCode: link.shortCode,
      original: link.original,
      totalClicks: totalByLink.get(link.id) ?? 0,
      clicksByDay: Array.from(
        dailyByLink.get(link.id) ?? [],
        ([date, count]) => ({ date, clicks: count }),
      ).sort((first, second) => first.date.localeCompare(second.date)),
    }));
  }
}
