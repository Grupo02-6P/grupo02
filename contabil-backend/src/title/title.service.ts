import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';

@Injectable()
export class TitleService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTitleDto) {
    const movement = await this.prisma.typeMovement.findUnique({
      where: { id: data.movementId },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    if (!movement) {
      throw new NotFoundException('Tipo de movimento não encontrado');
    }

    //Cria o título
    const title = await this.prisma.title.create({
      data: {
        code: data.code,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        value: data.value,
        status: data.status ?? 'ACTIVE',
        partnerId: data.partnerId,
        movementId: data.movementId,
      },
    });

    // 📘 Cria o lançamento contábil (JournalEntry + Lines)
    const journal = await this.prisma.journalEntry.create({
      data: {
        originType: 'TITLE',
        originId: title.id,
        date: new Date(),
        titleId: title.id,
        lines: {
          create: [
            {
              accountId: movement.debitAccountId,
              type: 'DEBIT',
              amount: data.value,
            },
            {
              accountId: movement.creditAccountId,
              type: 'CREDIT',
              amount: data.value,
            },
          ],
        },
      },
      include: {
        lines: { include: { account: true } },
      },
    });

    return { ...title, journal };
  }

  async findAll() {
    return this.prisma.title.findMany({
      include: {
        movement: true,
        partner: true,
        journalEntries: {
          where: { originType: 'TITLE' },
          include: { lines: { include: { account: true } } },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.title.findUnique({
      where: { id },
      include: {
        movement: true,
        partner: true,
        journalEntries: {
          where: { originType: 'TITLE' },
          include: { lines: { include: { account: true } } },
        },
      },
    });
  }

  async update(id: string, data: UpdateTitleDto) {
    return this.prisma.title.update({
      where: { id },
      data,
      include: { movement: true, partner: true },
    });
  }

  async remove(id: string) {
    await this.prisma.journalEntry.deleteMany({
      where: { originId: id, originType: 'TITLE' },
    });

    return this.prisma.title.delete({ where: { id } });
  }
}
