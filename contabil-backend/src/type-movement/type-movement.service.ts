import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTypeMovementDto } from './dto/create-type-movement.dto';
import { UpdateTypeMovementDto } from './dto/update-type-movement.dto';
import { FilterTypeMovementDto } from './dto/filter-type-movement.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { Status } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';

@Injectable()
export class TypeMovementService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService
  ) {}

  create(createTypeMovementDto: CreateTypeMovementDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'TypeMovement')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    if (createTypeMovementDto.creditAccountId === createTypeMovementDto.debitAccountId) {
      throw new BadRequestException('A conta de crédito e débito não podem ser iguais');
    }
    
    return this.prisma.typeMovement.create({
      data: createTypeMovementDto,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        creditAccount: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        debitAccount: {
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

  async findAll(filterDto: FilterTypeMovementDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'TypeMovement')) {
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
      creditAccountId,
      debitAccountId,
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
      AND: [accessibleBy(ability, 'read').typeMovement]
    };

    // Filtro de busca geral
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
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
    
    if (creditAccountId) {
      where.creditAccountId = creditAccountId;
    }
    
    if (debitAccountId) {
      where.debitAccountId = debitAccountId;
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
      this.prisma.typeMovement.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          creditAccount: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          debitAccount: {
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
      this.prisma.typeMovement.count({ where })
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

    if (!ability.can('read', 'TypeMovement')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.typeMovement.findUnique({
      where: { 
        id,
        AND: [accessibleBy(ability, 'read').typeMovement] 
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        creditAccountId: true,
        debitAccountId: true,
        creditAccount: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        debitAccount: {
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

  async update(id: string, updateTypeMovementDto: UpdateTypeMovementDto) {
    const ability = this.abilityService.ability;
    if (!ability.can('update', 'TypeMovement')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    if (updateTypeMovementDto.creditAccountId && updateTypeMovementDto.debitAccountId &&
        updateTypeMovementDto.creditAccountId === updateTypeMovementDto.debitAccountId) {
      throw new BadRequestException('A conta de crédito e débito não podem ser iguais');
    }
    
    const typeMovement = await this.prisma.typeMovement.findUnique({ 
      where: { 
        id,
        AND: [accessibleBy(ability, 'update').typeMovement] 
      },
      select: {
        id: true,
      },
    });

    if (!typeMovement) {
      throw new NotFoundException('Tipo de movimento não encontrado');
    }

    // Verificar permissões por campo
    for (const field of Object.keys(updateTypeMovementDto)) {
      if (!ability.can('update', 'TypeMovement', field)) {
        delete updateTypeMovementDto[field as keyof UpdateTypeMovementDto];
      }
    }

    return this.prisma.typeMovement.update({
      where: { id },
      data: updateTypeMovementDto,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        creditAccount: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        debitAccount: {
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

  async remove(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'TypeMovement')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o tipo de movimento existe e se o usuário tem acesso
    const typeMovement = await this.prisma.typeMovement.findUnique({
      where: {
        id,
        AND: [accessibleBy(ability, 'delete').typeMovement]
      },
    });

    if (!typeMovement) {
      throw new NotFoundException('Tipo de movimento não encontrado');
    }

    return this.prisma.typeMovement.delete({
      where: { id },
    });
  }

  inactivate(id: string) {
    const ability = this.abilityService.ability;
    if (!ability.can('delete', 'TypeMovement')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    return this.prisma.typeMovement.update({
      where: { id },
      data: { status: Status.INACTIVE }
    });
  }
}
