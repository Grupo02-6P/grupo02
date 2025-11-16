import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
          },
        },
        title: true,
        entry: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const journal = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: { account: true },
        },
        title: true,
        entry: true,
      },
    });

    if (!journal) throw new NotFoundException('Journal Entry not found');
    return journal;
  }
}
