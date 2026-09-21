import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CreateUserDto } from './dto/user-entities.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async create(data: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({ data });
      return this.withoutPasswordHash(user);
    } catch (error) {
      this.throwConflictForDuplicateEmail(error);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);

    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return this.withoutPasswordHash(user);
    } catch (error) {
      this.throwConflictForDuplicateEmail(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
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
