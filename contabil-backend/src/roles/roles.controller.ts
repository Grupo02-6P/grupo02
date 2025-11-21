import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo perfil de usuário' })
  @ApiResponse({ status: 201, description: 'Perfil criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar perfis de usuário' })
  @ApiResponse({ status: 200, description: 'Lista de perfis' })
  findAll(@Query() filterDto: FilterRoleDto) {
    return this.rolesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar perfil por ID' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar perfil' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover perfil' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @ApiResponse({ status: 200, description: 'Perfil removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
