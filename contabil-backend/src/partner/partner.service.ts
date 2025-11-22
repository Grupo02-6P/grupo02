import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { FilterPartnerDto } from './dto/filter-partner.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Status } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PartnerService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
    private auditService: AuditService,
  ) { }

  async create(createPartnerDto: CreatePartnerDto, currentUser: any) {
    console.log('--- AUDITORIA DEBUG ---');
    console.log('1. USUÁRIO RECEBIDO (PAYLOAD JWT):', currentUser);
    console.log('---------------------------');
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const newPartner = await this.prisma.partner.create({
      data: createPartnerDto,

    });

    try {
      await this.auditService.create({
        action: 'CREATE',
        entity: 'Partner',
        entityId: newPartner.id,
        oldValues: undefined,
        newValues: newPartner as any,
        user: { connect: { id: currentUser.id } },
        ipAddress: 'N/A', // Garante que não é null
        userAgent: 'N/A',
      });
    } catch (error) {
      // Se der erro na auditoria, apenas loga no terminal, mas NÃO trava o request
      console.error('⚠️ Falha ao registrar auditoria:', error);
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
      status,
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
        { cnpj: { contains: search, mode: 'insensitive' } },
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
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.partner.count({ where }),
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

  findOne(id: string, companyId?: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.partner.findUnique({
      where: { id, ...(companyId && { companyId }) },
    });
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto, currentUser: any) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const oldPartner = await this.prisma.partner.findUnique({ where: { id } });


    if (!oldPartner) {
      throw new UnauthorizedException('Parceiro não encontrado.');
    }

    const updatedPartner = await this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
    });

    this.auditService.create({
      action: 'UPDATE',
      entity: 'Partner',
      entityId: id,
      oldValues: oldPartner as any,
      newValues: updatedPartner as any,
      user: { connect: { id: currentUser.id } },
    }).catch(console.error);

    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
    });
  }

  async remove(id: string, currentUser: any, companyId?: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const partnerToDelete = await this.prisma.partner.findUnique({ where: { id } });

    const deleteResult = await this.prisma.partner.deleteMany({
      where: {
        id,
        ...(companyId && { companyId }),
      },
    });

    if (partnerToDelete) {
      this.auditService.create({
        action: 'DELETE',
        entity: 'Partner',
        entityId: id,
        oldValues: partnerToDelete as any,
        newValues: undefined, // Usar undefined para Json opcional vazio
        user: { connect: { id: currentUser.id } },
      }).catch(console.error);
    }

    return this.prisma.partner.deleteMany({
      where: {
        id,
        ...(companyId && { companyId }),
      },
    });
  }

  async inactivate(id: string, currentUser: any) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Partner')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const oldPartner = await this.prisma.partner.findUnique({ where: { id } });

    const updatedPartner = await this.prisma.partner.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });

    this.auditService.create({
      action: 'INACTIVATE',
      entity: 'Partner',
      entityId: id,
      oldValues: oldPartner as any,
      newValues: updatedPartner as any,
      user: { connect: { id: currentUser.id } },
    }).catch(console.error);

    return this.prisma.partner.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
