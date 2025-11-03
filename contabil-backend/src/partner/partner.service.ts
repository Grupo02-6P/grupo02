import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { FilterPartnerDto } from './dto/filter-partner.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Status } from '@prisma/client';

@Injectable()
export class PartnerService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService
  ) {}
  create(createPartnerDto: CreatePartnerDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.partner.create({
      data: createPartnerDto,
    });
  }

  async findAll(filterDto: FilterPartnerDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      name,
      address,
      cnpj,
      companyId,
      dateFrom,
      dateTo,
      status
    } = filterDto;

    // Se limit for -1, buscar todos os registros
    const getAllRecords = limit === -1;
    const skip = getAllRecords ? 0 : (page - 1) * limit;
    const take = getAllRecords ? undefined : limit;

    const where: any = {};
    // Filtro de busca geral
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtros específicos
    if (status) {
      where.status = status;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }
    
    if (cnpj) {
      where.cnpj = { contains: cnpj, mode: 'insensitive' };
    }
    
    if (companyId) {
      where.companyId = companyId;
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
      this.prisma.partner.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        select: {
          id: true,
          name: true,
          address: true,
          cnpj: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      this.prisma.partner.count({ where })
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
          hasPreviousPage: false
        }
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
        hasPreviousPage: page > 1
      }
    };
  }

  findOne(id: string, companyId?: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.partner.findUnique({
      where: { id, ...(companyId && { companyId }) },
    });
  }

  update(id: string, updatePartnerDto: UpdatePartnerDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
    });
  }

  remove(id: string, companyId?: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.partner.deleteMany({
      where: {
        id,
        ...(companyId && { companyId }),
      },
    });
  }

  inactivate(id: string) {
  const ability = this.abilityService.ability;
  if (!ability.can('delete', 'Partner')) {
    throw new UnauthorizedException('Ação não permitida');
  }
  return this.prisma.partner.update({
    where: { id },
    data: { status: Status.INACTIVE }
  });
}
}
