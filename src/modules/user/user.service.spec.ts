import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/user-entities.js';
import { UserService } from './user.service.js';

describe('UserService', () => {
  it('creates a user with the supplied data', async () => {
    const createdUser = {
      id: 'user-id',
      name: 'Maria',
      email: 'maria@example.com',
      createdAt: new Date(),
    };
    const prisma = {
      user: {
        create: vi.fn().mockResolvedValue(createdUser),
      },
    } as unknown as PrismaService;
    const service = new UserService(prisma);
    const data: CreateUserDto = {
      name: 'Maria',
      email: 'maria@example.com',
    };

    await expect(service.create(data)).resolves.toEqual(createdUser);
    expect(prisma.user.create).toHaveBeenCalledWith({ data });
  });

  it('throws when the user does not exist', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;
    const service = new UserService(prisma);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
