import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LinksService } from './links.service.js';

describe('LinksService', () => {
  it('creates a link for the authenticated user', async () => {
    const createdLink = {
      id: 'link-id',
      original: 'https://example.com/page',
      shortCode: 'abc12345',
      userId: 'user-id',
      createdAt: new Date(),
    };
    const createMock = vi.fn().mockResolvedValue(createdLink);
    const prisma = {
      link: {
        create: createMock,
      },
    } as unknown as PrismaService;
    const service = new LinksService(prisma);

    await expect(
      service.create({ original: ' https://example.com/page ' }, 'user-id'),
    ).resolves.toEqual(createdLink);

    expect(prisma.link.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        original: 'https://example.com/page',
        userId: 'user-id',
      }),
    });
    expect(createMock.mock.calls[0][0].data.shortCode).toHaveLength(8);
  });

  it('retries when the generated code already exists', async () => {
    const conflict = Object.assign(new Error('duplicate'), { code: 'P2002' });
    const prisma = {
      link: {
        create: vi.fn().mockRejectedValueOnce(conflict).mockResolvedValue({
          id: 'link-id',
          original: 'https://example.com',
          shortCode: 'newcode1',
          userId: 'user-id',
          createdAt: new Date(),
        }),
      },
    } as unknown as PrismaService;
    const service = new LinksService(prisma);

    await expect(
      service.create({ original: 'https://example.com' }, 'user-id'),
    ).resolves.toMatchObject({ shortCode: 'newcode1' });
    expect(prisma.link.create).toHaveBeenCalledTimes(2);
  });

  it('returns only links belonging to the user', async () => {
    const prisma = {
      link: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;
    const service = new LinksService(prisma);

    await expect(service.findByUser('user-id')).resolves.toEqual([]);
    expect(prisma.link.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('throws when a short code does not exist', async () => {
    const prisma = {
      link: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;
    const service = new LinksService(prisma);

    await expect(service.findByCode('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
