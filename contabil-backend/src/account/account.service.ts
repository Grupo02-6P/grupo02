import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { Status } from '@prisma/client';
import { FilterAccountDto } from './dto/filter-account.dto';
import { accessibleBy } from '@casl/prisma';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
@Injectable()
export class AccountService {
  constructor(
      private prisma: PrismaService,
      private abilityService: CaslAbilityService
    ) {}

  async create(createAccountDto: CreateAccountDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Account')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    
    console.log('CreateAccountDto:', createAccountDto);
    
    // Validar se a conta pai existe quando parentAccountId é fornecido
    if (createAccountDto.parentAccountId) {
      const parentExists = await this.prisma.account.findUnique({
        where: { id: createAccountDto.parentAccountId },
      });
      
      if (!parentExists) {
        throw new NotFoundException('Conta pai não encontrada');
      }


      console.log('Parent Account ID:', createAccountDto.parentAccountId);
    } else {
      // Definir explicitamente como null se não fornecido
      createAccountDto.parentAccountId = null;
    }
    
    return this.prisma.account.create({
      data: createAccountDto,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        level: true,
        acceptsPosting: true,
        active: true,
        parentAccount: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        childAccounts: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(filterDto: FilterAccountDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;
    
    if (!ability.can('read', 'Account')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    var { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy, 
      sortOrder = 'desc',
      name,
      description,
      level,
      acceptsPosting,
      active,
      dateFrom,
      dateTo,
      status
    } = filterDto;

    // Se limit for -1, buscar todos os registros
    const getAllRecords = limit === -1;
    const skip = getAllRecords ? 0 : (page - 1) * limit;
    const take = getAllRecords ? undefined : limit;

    // Construir filtros dinâmicos
    const where: any = {
      AND: [accessibleBy(ability, 'read').Account]
    };

    // Filtro de busca geral
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtros específicos
    if (status) {
      where.active = status;
    }

    if (active) {
      where.active = active;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    
    if (description) {
      where.description = { contains: description, mode: 'insensitive' };
    }
    
    if (level !== undefined) {
      where.level = level;
    }
    
    if (acceptsPosting !== undefined) {
      where.acceptsPosting = acceptsPosting == 'true' ? true : false;
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
      this.prisma.account.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          level: true,
          acceptsPosting: true,
          active: true,
          parentAccountId: true,
          parentAccount: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          childAccounts: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      this.prisma.account.count({ where })
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

  findOne(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Account')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.account.findUnique({
      where: { id },
    });
  }

  update(id: string, updateAccountDto: UpdateAccountDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Account')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  remove(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Account')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.account.delete({
      where: { id },
    });
  }

  inactivate(id: string) {
    const ability = this.abilityService.ability;
    if (!ability.can('delete', 'Account')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    return this.prisma.account.update({
      where: { id },
      data: { active: Status.INACTIVE }
    });
  }
}
