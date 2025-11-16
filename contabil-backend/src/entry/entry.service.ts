import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@Injectable()
export class EntryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEntryDto) {
    const entryType = await this.prisma.typeEntry.findUnique({
      where: { id: data.entryTypeId },
      include: { accountCleared: true },
    });

    if (!entryType) {
      throw new NotFoundException('Tipo de entrada não encontrado');
    }

    // Busca o título vinculado
    const title = await this.prisma.title.findUnique({
      where: { id: data.titleId },
      include: {
        movement: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
    });

    if (!title) {
      throw new NotFoundException('Título não encontrado');
    }

    // Cria o registro da entrada
    const entry = await this.prisma.entry.create({
      data: {
        code: data.code,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        value: data.value,
        status: data.status ?? 'ACTIVE',
        titleId: data.titleId,
        entryTypeId: data.entryTypeId,
      },
    });

    // Cria o lançamento contábil (JournalEntry)
    const journal = await this.prisma.journalEntry.create({
      data: {
        originType: 'ENTRY',
        originId: entry.id,
        date: new Date(),
        titleId: title.id,
        lines: {
          create: [
            {
              // Débito na conta de compensação
              accountId: entryType.accountClearedId,
              type: 'DEBIT',
              amount: data.value,
            },
            {
              // Crédito na conta de destino (ex: banco, cliente etc.)
              accountId: title.movement.debitAccountId,
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

    return { ...entry, journal };
  }

  async findAll() {
    return this.prisma.entry.findMany({
      include: {
        entryType: true,
        title: {
          include: { movement: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.entry.findUnique({
      where: { id },
      include: {
        entryType: true,
        title: {
          include: { movement: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateEntryDto) {
    return this.prisma.entry.update({
      where: { id },
      data,
      include: { entryType: true, title: true },
    });
  }

  async remove(id: string) {
    return this.prisma.entry.delete({ where: { id } });
  }
}
