import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';

export class PrismaService extends PrismaClient implements OnModuleInit {}
