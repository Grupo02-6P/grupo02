import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { accessibleBy } from '@casl/prisma';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';

@Injectable()
export class EntryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly abilityService: CaslAbilityService,
  ) {}

  create(createEntryDto: CreateEntryDto) {
    return 'This action adds a new entry';
  }

  /**
   * Busca os lançamentos com filtros, paginação e regras de CASL
   */
  async findAll(filterDto: BaseFilterDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Entry')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    let {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      status,
    } = filterDto;

    // filtros específicos para Entry
    const { tittleId, entryTypeId } = filterDto as any;

    // support -1 to fetch all
    const getAllRecords = limit === -1;
    const skip = getAllRecords ? 0 : (page - 1) * limit;
    const take = getAllRecords ? undefined : limit;

    const where: any = {
      AND: [accessibleBy(ability, 'read').Entry],
    };

    // busca geral
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tittle: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tittleId) {
      where.tittleId = tittleId;
    }

    if (entryTypeId) {
      where.entryTypeId = entryTypeId;
    }

    if (!sortBy) sortBy = 'createdAt';

    if (dateFrom || dateTo) {
      where.date = {} as any;
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.entry.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        select: {
          id: true,
          code: true,
          description: true,
          date: true,
          value: true,
          status: true,
          tittle: {
            select: { id: true, code: true, description: true, value: true },
          },
          entryType: {
            select: { id: true, name: true, description: true },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          [sortBy]: sortOrder as any,
        },
      }),
      this.prisma.entry.count({ where }),
    ]);

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

  findOne(id: number) {
    return `This action returns a #${id} entry`;
  }

  update(id: number, updateEntryDto: UpdateEntryDto) {
    return `This action updates a #${id} entry`;
  }

  remove(id: number) {
    return `This action removes a #${id} entry`;
  }
}
