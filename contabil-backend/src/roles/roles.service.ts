import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Role')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const { permissions, ...roleData } = createRoleDto;

    // Verificar se já existe um role com esse nome
    const existingRole = await this.prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      throw new BadRequestException(
        `Role com nome '${roleData.name}' já existe`,
      );
    }

    // Validar se há pelo menos uma permissão
    if (!permissions || permissions.length === 0) {
      throw new BadRequestException(
        'Um role deve ter pelo menos uma permissão',
      );
    }

    // Criar o role e suas permissões em uma transação
    return this.prisma.$transaction(async (prisma) => {
      // 1. Criar o role
      const role = await prisma.role.create({
        data: roleData,
      });

      // 2. Processar cada permissão
      for (const permissionData of permissions) {
        // Buscar o resource
        const resource = await prisma.resource.findUnique({
          where: { name: permissionData.resource },
        });

        if (!resource) {
          throw new BadRequestException(
            `Recurso '${permissionData.resource}' não encontrado`,
          );
        }

        // Buscar ou criar a permission
        let permission = await prisma.permission.findFirst({
          where: {
            action: permissionData.action as any,
            resourceId: resource.id,
            fields: permissionData.fields
              ? { equals: permissionData.fields }
              : undefined,
            conditions: permissionData.conditions
              ? { equals: permissionData.conditions }
              : undefined,
          },
        });

        if (!permission) {
          permission = await prisma.permission.create({
            data: {
              action: permissionData.action as any,
              resourceId: resource.id,
              fields: permissionData.fields || undefined,
              conditions: permissionData.conditions || undefined,
            },
          });
        }

        // Criar a relação role-permission
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }

      // Retornar o role com todas as informações
      return prisma.role.findUnique({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  resource: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async findAll(filterDto: FilterRoleDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Role')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    let {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      name,
      description,
      isDefault,
    } = filterDto;

    // Construir filtro dinâmico
    const where: any = {};

    if (sortBy === undefined) {
      sortBy = 'createdAt';
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive',
      };
    }

    if (isDefault !== undefined) {
      where.isDefault = isDefault;
    }

    // Se limit = -1, retornar todos sem paginação
    if (limit === -1) {
      const roles = await this.prisma.role.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  resource: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      return {
        data: roles,
        pagination: {
          page: 1,
          limit: roles.length,
          total: roles.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Paginação normal
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  resource: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: roles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  findOne(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Role')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: {
              include: {
                resource: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Role')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o role existe
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        users: true, // Incluir usuários que usam este role
      },
    });

    if (!existingRole) {
      throw new BadRequestException('Role não encontrado');
    }

    const { permissions, ...roleData } = updateRoleDto;
    if (roleData.isDefault) {
      delete roleData.name;
    }
    // Se o nome está sendo alterado, verificar se já existe outro role com esse nome
    if (roleData.name && roleData.name !== existingRole.name) {
      const roleWithSameName = await this.prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (roleWithSameName) {
        throw new BadRequestException(
          `Role com nome '${roleData.name}' já existe`,
        );
      }
    }

    // Se há usuários usando este role e permissões estão sendo alteradas, mostrar aviso
    if (permissions && existingRole.users.length > 0) {
      console.log(
        `⚠️ Atualizando permissões do role '${existingRole.name}' que possui ${existingRole.users.length} usuário(s) associado(s)`,
      );
    }

    delete roleData.isDefault;

    // Executar a atualização em uma transação
    return this.prisma.$transaction(async (prisma) => {
      // 1. Atualizar dados básicos do role
      const updatedRole = await prisma.role.update({
        where: { id },
        data: roleData,
      });

      // 2. Se permissions foram fornecidas, atualizar as permissões
      if (permissions && permissions.length > 0) {
        // Remover todas as permissões existentes
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Adicionar as novas permissões
        for (const permissionData of permissions) {
          // Buscar o resource
          const resource = await prisma.resource.findUnique({
            where: { name: permissionData.resource },
          });

          if (!resource) {
            throw new BadRequestException(
              `Recurso '${permissionData.resource}' não encontrado`,
            );
          }

          // Buscar ou criar a permission
          let permission = await prisma.permission.findFirst({
            where: {
              action: permissionData.action as any,
              resourceId: resource.id,
              fields: permissionData.fields
                ? { equals: permissionData.fields }
                : undefined,
              conditions: permissionData.conditions
                ? { equals: permissionData.conditions }
                : undefined,
            },
          });

          if (!permission) {
            permission = await prisma.permission.create({
              data: {
                action: permissionData.action as any,
                resourceId: resource.id,
                fields: permissionData.fields || undefined,
                conditions: permissionData.conditions || undefined,
              },
            });
          }

          // Criar a nova relação role-permission
          await prisma.rolePermission.create({
            data: {
              roleId: id,
              permissionId: permission.id,
            },
          });
        }
      } else if (permissions && permissions.length === 0) {
        // Se um array vazio foi fornecido, não permitir (role não pode ficar sem permissões)
        throw new BadRequestException(
          'Um role deve ter pelo menos uma permissão',
        );
      }

      // 3. Retornar o role atualizado com todas as informações
      return prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  resource: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const abilities = this.abilityService.ability;
    if (!abilities.can('delete', 'Role')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!role) {
      throw new BadRequestException('Role não encontrado');
    }

    if (role.isDefault) {
      throw new BadRequestException(
        'Não é permitido deletar um role padrão do sistema',
      );
    }

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId: id,
      },
    });

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
