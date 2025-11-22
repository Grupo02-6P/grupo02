import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AuditLogCreateInput) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }
}