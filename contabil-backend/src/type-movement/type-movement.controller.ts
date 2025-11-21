import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TypeMovementService } from './type-movement.service';
import { CreateTypeMovementDto } from './dto/create-type-movement.dto';
import { UpdateTypeMovementDto } from './dto/update-type-movement.dto';
import { FilterTypeMovementDto } from './dto/filter-type-movement.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('type-movements')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('type-movement')
export class TypeMovementController {
  constructor(private readonly typeMovementService: TypeMovementService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo tipo de movimento contábil' })
  @ApiResponse({ status: 201, description: 'Tipo de movimento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createTypeMovementDto: CreateTypeMovementDto) {
    return this.typeMovementService.create(createTypeMovementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de movimento com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de movimento' })
  findAll(@Query() filterDto: FilterTypeMovementDto) {
    return this.typeMovementService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de movimento por ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de movimento' })
  @ApiResponse({ status: 200, description: 'Tipo de movimento encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de movimento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.typeMovementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de movimento' })
  @ApiParam({ name: 'id', description: 'ID do tipo de movimento' })
  @ApiResponse({ status: 200, description: 'Tipo de movimento atualizado com sucesso' })
  update(
    @Param('id') id: string,
    @Body() updateTypeMovementDto: UpdateTypeMovementDto,
  ) {
    return this.typeMovementService.update(id, updateTypeMovementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tipo de movimento' })
  @ApiParam({ name: 'id', description: 'ID do tipo de movimento' })
  @ApiResponse({ status: 200, description: 'Tipo de movimento removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.typeMovementService.remove(id);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar tipo de movimento' })
  @ApiParam({ name: 'id', description: 'ID do tipo de movimento' })
  @ApiResponse({ status: 200, description: 'Tipo de movimento inativado com sucesso' })
  inactive(@Param('id') id: string) {
    return this.typeMovementService.inactivate(id);
  }
}
