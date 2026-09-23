import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserService } from './user.service.js';

describe('UserService', () => {
  it('returns only the authenticated user', async () => {
    const user = {
      id: 'user-id',
      name: 'Maria',
      email: 'maria@example.com',
      createdAt: new Date(),
    };
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue(user) },
    } as unknown as PrismaService;
    const service = new UserService(prisma);

    await expect(service.findOne('user-id', 'user-id')).resolves.toEqual(user);
  });

  it('rejects access to another user', async () => {
    const service = new UserService({} as PrismaService);

    await expect(service.findOne('other-id', 'user-id')).rejects.toThrow(
      'Você não pode acessar outro usuário',
    );
  });

  it('throws when the user does not exist', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;
    const service = new UserService(prisma);

    await expect(service.findOne('missing-id', 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
