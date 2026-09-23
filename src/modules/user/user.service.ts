import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { normalizeEmail } from './user.utils.js';

@Injectable()
export class UserService {
  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, requesterId: string) {
    this.ensureOwner(id, requesterId);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, requesterId: string, data: UpdateUserDto) {
    await this.findOne(id, requesterId);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name === undefined ? {} : { name: data.name.trim() }),
          ...(data.email === undefined
            ? {}
            : { email: normalizeEmail(data.email) }),
        },
      });
      return this.withoutPasswordHash(user);
    } catch (error) {
      this.throwConflictForDuplicateEmail(error);
      throw error;
    }
  }

  async remove(id: string, requesterId: string) {
    await this.findOne(id, requesterId);
    return this.prisma.user.delete({
      where: { id },
      select: this.safeUserSelect,
    });
  }

  private ensureOwner(id: string, requesterId: string): void {
    if (id !== requesterId) {
      throw new ForbiddenException('Você não pode acessar outro usuário');
    }
  }

  private throwConflictForDuplicateEmail(error: unknown): void {
    if (this.isUniqueConstraintError(error)) {
      throw new ConflictException('E-mail já cadastrado');
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }

  private withoutPasswordHash<T extends { passwordHash?: string | null }>(
    user: T,
  ): Omit<T, 'passwordHash'> {
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return safeUser;
  }
}
