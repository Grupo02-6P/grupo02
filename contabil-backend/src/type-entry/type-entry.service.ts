import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTypeEntryDto } from './dto/create-type-entry.dto';
import { UpdateTypeEntryDto } from './dto/update-type-entry.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { FilterTypeEntryDto } from './dto/filter-type-entry.dto';
import { Status } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';

@Injectable()
export class TypeEntryService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
  ) {}

  create(createTypeEntryDto: CreateTypeEntryDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'TypeEntry')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.typeEntry.create({
      data: createTypeEntryDto,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        accountCleared: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(
    filterDto: FilterTypeEntryDto,
  ): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'TypeEntry')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    let {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder = 'desc',
      name,
      description,
      accountClearedId,
      dateFrom,
      dateTo,
      status,
    } = filterDto;

    // Se limit for -1, buscar todos os registros
    const getAllRecords = limit === -1;
    const skip = getAllRecords ? 0 : (page - 1) * limit;
    const take = getAllRecords ? undefined : limit;

    // Construir filtros dinâmicos
    const where: any = {
      AND: [accessibleBy(ability, 'read').TypeEntry],
    };

    // Filtro de busca geral
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (status) {
      where.status = status;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (description) {
      where.description = { contains: description, mode: 'insensitive' };
    }

    if (accountClearedId) {
      where.accountClearedId = accountClearedId;
    }

    if (sortBy === undefined) {
      sortBy = 'createdAt';
    }

    // Filtros de data
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Executar consultas em paralelo para melhor performance
    const [data, total] = await Promise.all([
      this.prisma.typeEntry.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          accountCleared: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.typeEntry.count({ where }),
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

  findOne(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'TypeEntry')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.typeEntry.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        accountClearedId: true,
        accountCleared: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, updateTypeEntryDto: UpdateTypeEntryDto) {
    const ability = this.abilityService.ability;

    const typeEntry = await this.prisma.typeEntry.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!typeEntry) {
      throw new NotFoundException('Tipo de entrada não encontrado');
    }

    // Verificar permissões por campo
    for (const field of Object.keys(updateTypeEntryDto)) {
      if (!ability.can('update', 'TypeEntry', field)) {
        delete updateTypeEntryDto[field as keyof UpdateTypeEntryDto];
      }
    }

    return this.prisma.typeEntry.update({
      where: { id },
      data: updateTypeEntryDto,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        accountClearedId: true,
        accountCleared: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'TypeEntry')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o tipo de entrada existe e se o usuário tem acesso
    const typeEntry = await this.prisma.typeEntry.findUnique({
      where: {
        id,
      },
    });

    if (!typeEntry) {
      throw new NotFoundException('Tipo de entrada não encontrado');
    }

    return this.prisma.typeEntry.delete({
      where: { id },
    });
  }

  async inactivate(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'TypeEntry')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o tipo de entrada existe e se o usuário tem acesso
    const typeEntry = await this.prisma.typeEntry.findUnique({
      where: {
        id,
      },
    });

    if (!typeEntry) {
      throw new NotFoundException('Tipo de entrada não encontrado');
    }

    return this.prisma.typeEntry.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
