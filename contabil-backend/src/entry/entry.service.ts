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
    const tittle = await this.prisma.tittle.findUnique({
      where: { id: data.tittleId },
      include: {
        movement: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
    });

    if (!tittle) {
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
        tittleId: data.tittleId,
        entryTypeId: data.entryTypeId,
      },
    });

    // Cria o lançamento contábil (JournalEntry)
    const journal = await this.prisma.journalEntry.create({
      data: {
        originType: 'ENTRY',
        originId: entry.id,
        date: new Date(),
        tittleId: tittle.id,
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
              accountId: tittle.movement.debitAccountId,
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
        tittle: {
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
        tittle: {
          include: { movement: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateEntryDto) {
    return this.prisma.entry.update({
      where: { id },
      data,
      include: { entryType: true, tittle: true },
    });
  }

  async remove(id: string) {
    return this.prisma.entry.delete({ where: { id } });
  }
}
