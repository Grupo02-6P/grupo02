import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTittleDto } from './dto/create-tittle.dto';
import { UpdateTittleDto } from './dto/update-tittle.dto';

@Injectable()
export class TittleService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTittleDto) {
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
    const tittle = await this.prisma.tittle.create({
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

    //Cria o lançamento contábil (JournalEntry + Lines)
    const journal = await this.prisma.journalEntry.create({
      data: {
        tittleId: tittle.id,
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
      include: { lines: { include: { account: true } } },
    });

    return { ...tittle, journal };
  }

  async findAll() {
    return this.prisma.tittle.findMany({
      include: {
        movement: true,
        partner: true,
        journalEntries: {
          include: { lines: { include: { account: true } } },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.tittle.findUnique({
      where: { id },
      include: {
        movement: true,
        partner: true,
        journalEntries: {
          include: { lines: { include: { account: true } } },
        },
      },
    });
  }

  async update(id: string, data: UpdateTittleDto) {
    return this.prisma.tittle.update({
      where: { id },
      data,
      include: { movement: true, partner: true },
    });
  }

  async remove(id: string) {
    return this.prisma.tittle.delete({ where: { id } });
  }
}
