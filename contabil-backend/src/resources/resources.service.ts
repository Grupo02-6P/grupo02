import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
  ) {}

  create(createResourceDto: CreateResourceDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Resource')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.resource.create({
      data: createResourceDto,
    });
  }

  async findAll() {
    const ability = this.abilityService.ability;
    if (!ability.can('read', 'Resource')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    const resources = await this.prisma.resource.findMany();
    return { data: resources };
  }

  async findOne(id: string) {
    const ability = this.abilityService.ability;
    if (!ability.can('read', 'Resource')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    return this.prisma.resource.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    const ability = this.abilityService.ability;
    if (!ability.can('update', 'Resource')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
    });
  }

  async remove(id: string) {
    const ability = this.abilityService.ability;
    if (!ability.can('delete', 'Resource')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    return this.prisma.resource.delete({
      where: { id },
    });
  }
}
