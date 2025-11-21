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
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('entries')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('entry')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo lançamento contábil' })
  @ApiResponse({ status: 201, description: 'Lançamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createEntryDto: CreateEntryDto) {
    return this.entryService.create(createEntryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os lançamentos contábeis' })
  @ApiResponse({ status: 200, description: 'Lista de lançamentos' })
  findAll() {
    return this.entryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lançamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do lançamento' })
  @ApiResponse({ status: 200, description: 'Lançamento encontrado' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  findOne(@Param('id') id: number) {
    return this.entryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar lançamento' })
  @ApiParam({ name: 'id', description: 'ID do lançamento' })
  @ApiResponse({ status: 200, description: 'Lançamento atualizado com sucesso' })
  update(@Param('id') id: number, @Body() updateEntryDto: UpdateEntryDto) {
    return this.entryService.update(id, updateEntryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover lançamento' })
  @ApiParam({ name: 'id', description: 'ID do lançamento' })
  @ApiResponse({ status: 200, description: 'Lançamento removido com sucesso' })
  remove(@Param('id') id: number) {
    return this.entryService.remove(id);
  }
}
