import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma, Role, StatusUsers } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { accessibleBy } from '@casl/prisma';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { URLSearchParams } from 'node:url';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'User')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    if (createUserDto.email) {
      const userExists = await this.findByEmail(createUserDto.email);
      if (userExists) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);
    return this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(filterDto: FilterUserDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'User')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    let {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      name,
      email,
      roleId,
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
      AND: [accessibleBy(ability, 'read').User],
    };

    // Filtro de busca geral
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (sortBy === undefined) {
      sortBy = 'createdAt';
    }
    // Filtros específicos
    if (status) {
      where.status = status;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (roleId) {
      where.roleId = roleId;
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
      this.prisma.user.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.user.count({ where }),
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

  async findAllByRole(role: string) {
    const ability = this.abilityService.ability;

    //coloca essas duas verificações de permissão porque para criar uma escola eu preciso visualizar nutricionistas
    if (!ability.can('read', 'User') && !ability.can('create', 'School')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    const users = await this.prisma.user.findMany({
      where: {
        role: { name: role },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { data: users };
  }

  findOne(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'User')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.user.findUnique({
      where: {
        id,
        AND: [accessibleBy(ability, 'read').User],
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const ability = this.abilityService.ability;

    const user = await this.prisma.user.findUnique({
      where: {
        id,
        AND: [accessibleBy(ability, 'update').User],
      },
      select: {
        id: true,
        roleId: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    for (const field of Object.keys(updateUserDto)) {
      if (!ability.can('update', 'User', field)) {
        delete updateUserDto[field as keyof UpdateUserDto];
      }
    }

    if (updateUserDto.email) {
      const userExists = await this.findByEmail(updateUserDto.email);
      if (userExists && userExists.id !== id) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  remove(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'User')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  findOneWithoutCasl(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  inactivate(id: string) {
    const ability = this.abilityService.ability;
    if (!ability.can('delete', 'User')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    return this.prisma.user.update({
      where: { id },
      data: { status: StatusUsers.INACTIVE },
    });
  }
}
