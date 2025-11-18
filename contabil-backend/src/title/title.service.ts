import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';

@Injectable()
export class TitleService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
  ) {}

  async create(data: CreateTitleDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

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
        titleId: title.id,
        originType: 'TITLE',
        originId: title.id,
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

  async findAll(filterDto: BaseFilterDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      dateFrom,
      dateTo,
    } = filterDto;

    // Se limit for -1, buscar todos os registros
    const getAllRecords = limit === -1;
    const skip = getAllRecords ? 0 : (page - 1) * limit;
    const take = getAllRecords ? undefined : limit;

    const where: any = {};

    // Filtro de busca geral
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (status) {
      where.status = status;
    }

    // Filtros de data
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    // Executar consultas em paralelo
    const [data, total] = await Promise.all([
      this.prisma.title.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        include: {
          movement: true,
          partner: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.title.count({ where }),
    ]);

    // Se estiver buscando todos os registros, ajustar metadados de paginação
    if (getAllRecords) {
      return {
        data,
        pagination: {
          page: 1,
          limit: total,
          total,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.title.findUnique({
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

  async update(id: string, data: UpdateTitleDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.title.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { movement: true, partner: true },
    });
  }

  async remove(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Remove os lançamentos contábeis relacionados
    await this.prisma.journalEntry.deleteMany({
      where: { titleId: id },
    });

    return this.prisma.title.delete({ where: { id } });
  }

  async inactivate(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o título existe
    const title = await this.prisma.title.findUnique({
      where: { id },
    });

    if (!title) {
      throw new NotFoundException('Título não encontrado');
    }

    return this.prisma.title.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
