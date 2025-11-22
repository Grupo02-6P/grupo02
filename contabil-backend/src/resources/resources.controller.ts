import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('resources')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo recurso do sistema' })
  @ApiResponse({ status: 201, description: 'Recurso criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os recursos do sistema' })
  @ApiResponse({ status: 200, description: 'Lista de recursos' })
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar recurso por ID' })
  @ApiParam({ name: 'id', description: 'ID do recurso' })
  @ApiResponse({ status: 200, description: 'Recurso encontrado' })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado' })
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar recurso' })
  @ApiParam({ name: 'id', description: 'ID do recurso' })
  @ApiResponse({ status: 200, description: 'Recurso atualizado com sucesso' })
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover recurso' })
  @ApiParam({ name: 'id', description: 'ID do recurso' })
  @ApiResponse({ status: 200, description: 'Recurso removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
