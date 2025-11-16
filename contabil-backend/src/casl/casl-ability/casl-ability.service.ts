import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery } from '@casl/prisma';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// ===============================
// 🔧 Tipos do CASL
// ===============================
export type PermActions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type PermResources = string | 'all';

export type AppAbility = PureAbility<[PermActions, PermResources], PrismaQuery>;

// ===============================
// 🧩 Mapa de nomes → strings (para runtime)
// ===============================
const resourceMap = {
  User: 'User',
  Role: 'Role',
  Resource: 'Resource',
  Permission: 'Permission',
  Partner: 'Partner',
  Account: 'Account',
  TypeMovement: 'TypeMovement',
  TypeEntry: 'TypeEntry',
  all: 'all',
} as const;

// Função helper para mapear nomes de resource
function mapResourceName(resourceName: string): string | undefined {
  // Primeiro tenta mapeamento direto
  if (resourceMap[resourceName]) {
    return resourceMap[resourceName];
  }

  // Se não encontrar, retorna o próprio nome
  return resourceName;
}

// Helper para pegar os nomes válidos
type ResourceName = keyof typeof resourceMap;

@Injectable({ scope: Scope.REQUEST })
export class CaslAbilityService {
  ability: AppAbility;

  constructor(private readonly prisma: PrismaService) {}

  async createForUser(user: User): Promise<AppAbility> {
    if (!user?.roleId) {
      throw new UnauthorizedException('Usuário sem papel associado');
    }

    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        rolePermissions: {
          include: {
            permission: { include: { resource: true } },
          },
        },
      },
    });

    if (!role) {
      throw new UnauthorizedException('Papel não encontrado para o usuário');
    }

    const permissions = role.rolePermissions?.map((rp) => rp.permission) || [];

    for (const permission of permissions) {
      if (!permission?.resource?.name) {
        continue;
      }

      const action = permission.action as PermActions;
      const resourceName = permission.resource.name; // string
      const mappedResource = mapResourceName(resourceName);

      if (!resourceName || !mappedResource) {
        continue;
      }

      let fields: string[] | undefined;

      // Tratar campos vazios ou nulos como undefined
      if (
        !permission.fields ||
        permission.fields === '[]' ||
        (Array.isArray(permission.fields) && permission.fields.length === 0)
      ) {
        fields = undefined;
      } else if (Array.isArray(permission.fields)) {
        fields = permission.fields as string[];
      } else if (typeof permission.fields === 'string') {
        // Se for uma string, tentar parsear como JSON primeiro
        try {
          const parsed = JSON.parse(permission.fields);
          if (Array.isArray(parsed) && parsed.length > 0) {
            fields = parsed;
          } else {
            fields = undefined;
          }
        } catch {
          // Se não for JSON válido, tratar como string única
          fields = [permission.fields];
        }
      } else if (permission.fields && typeof permission.fields === 'object') {
        try {
          // Caso o JSON no banco tenha sido salvo como objeto
          const parsed = JSON.parse(JSON.stringify(permission.fields));
          if (Array.isArray(parsed) && parsed.length > 0) {
            fields = parsed;
          } else {
            fields = undefined;
          }
        } catch {
          fields = undefined;
        }
      }

      const conditions = this.interpolate(permission.conditions, user);

      builder.can(action, mappedResource, fields, conditions);
    }

    this.ability = builder.build();

    return this.ability;
  }

  private interpolate(conditions: any, user: User) {
    if (!conditions) return undefined;
    try {
      const json = JSON.stringify(conditions);
      const replaced = json.replace(/\$\{user\.id\}/g, user.id);
      return JSON.parse(replaced);
    } catch {
      return undefined;
    }
  }
}
