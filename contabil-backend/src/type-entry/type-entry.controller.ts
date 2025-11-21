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
import { TypeEntryService } from './type-entry.service';
import { CreateTypeEntryDto } from './dto/create-type-entry.dto';
import { UpdateTypeEntryDto } from './dto/update-type-entry.dto';
import { FilterTypeEntryDto } from './dto/filter-type-entry.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('type-entries')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('type-entry')
export class TypeEntryController {
  constructor(private readonly typeEntryService: TypeEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo tipo de entrada/baixa' })
  @ApiResponse({ status: 201, description: 'Tipo de entrada criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createTypeEntryDto: CreateTypeEntryDto) {
    return this.typeEntryService.create(createTypeEntryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de entrada com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de entrada' })
  findAll(@Query() filterDto: FilterTypeEntryDto) {
    return this.typeEntryService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de entrada por ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de entrada' })
  @ApiResponse({ status: 200, description: 'Tipo de entrada encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de entrada não encontrado' })
  findOne(@Param('id') id: string) {
    return this.typeEntryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de entrada' })
  @ApiParam({ name: 'id', description: 'ID do tipo de entrada' })
  @ApiResponse({ status: 200, description: 'Tipo de entrada atualizado com sucesso' })
  update(
    @Param('id') id: string,
    @Body() updateTypeEntryDto: UpdateTypeEntryDto,
  ) {
    return this.typeEntryService.update(id, updateTypeEntryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tipo de entrada' })
  @ApiParam({ name: 'id', description: 'ID do tipo de entrada' })
  @ApiResponse({ status: 200, description: 'Tipo de entrada removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.typeEntryService.remove(id);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar tipo de entrada' })
  @ApiParam({ name: 'id', description: 'ID do tipo de entrada' })
  @ApiResponse({ status: 200, description: 'Tipo de entrada inativado com sucesso' })
  inactive(@Param('id') id: string) {
    return this.typeEntryService.inactivate(id);
  }
}
