import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateLinkDto } from './dto/create-link.dto.js';

@Injectable()
export class LinksService {
  private readonly codeAlphabet =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLinkDto, userId: string) {
    const original = data.original.trim();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await this.prisma.link.create({
          data: {
            original,
            shortCode: this.generateCode(),
            userId,
          },
        });
      } catch (error) {
        if (!this.isUniqueConstraintError(error)) throw error;
      }
    }

    throw new Error('Não foi possível gerar um código curto único');
  }

  findByUser(userId: string) {
    return this.prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCode(shortCode: string) {
    const link = await this.prisma.link.findUnique({ where: { shortCode } });

    if (!link) {
      throw new NotFoundException('Link não encontrado');
    }

    return link;
  }

  private generateCode(length = 8): string {
    const bytes = randomBytes(length);
    return Array.from(
      bytes,
      (byte) => this.codeAlphabet[byte % this.codeAlphabet.length],
    ).join('');
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
