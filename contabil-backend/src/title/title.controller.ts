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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TitleService } from './title.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ReverseTitleDto } from './dto/reverse-title.dto';

@ApiTags('titles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('title')
export class TitleController {
  constructor(private readonly titleService: TitleService) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo título a pagar/receber' })
  @ApiResponse({ status: 201, description: 'Título criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createTitleDto: CreateTitleDto) {
    return this.titleService.create(createTitleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar títulos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de títulos' })
  findAll(@Query() filterDto: BaseFilterDto) {
    return this.titleService.findAll(filterDto);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar título' })
  @ApiParam({ name: 'id', description: 'ID do título' })
  @ApiResponse({ status: 200, description: 'Título inativado com sucesso' })
  inactive(@Param('id') id: string) {
    return this.titleService.inactivate(id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Pagar/liquidar título' })
  @ApiParam({ name: 'id', description: 'ID do título' })
  @ApiResponse({ status: 200, description: 'Título pago com sucesso' })
  pay(@Param('id') id: string) {
    return this.titleService.pay(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar título por ID' })
  @ApiParam({ name: 'id', description: 'ID do título' })
  @ApiResponse({ status: 200, description: 'Título encontrado' })
  @ApiResponse({ status: 404, description: 'Título não encontrado' })
  findOne(@Param('id') id: string) {
    return this.titleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar título' })
  @ApiParam({ name: 'id', description: 'ID do título' })
  @ApiResponse({ status: 200, description: 'Título atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateTitleDto: UpdateTitleDto) {
    return this.titleService.update(id, updateTitleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover título' })
  @ApiParam({ name: 'id', description: 'ID do título' })
  @ApiResponse({ status: 200, description: 'Título removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.titleService.remove(id);
  }

  @Post(':id/reverse')
  @ApiOperation({ summary: 'Estornar pagamento de título' })
  @ApiParam({ name: 'id', description: 'ID do título' })
  @ApiResponse({ status: 201, description: 'Estorno realizado com sucesso' })
  reverse(
    @Param('id') id: string,
    @Body() reverseDto: ReverseTitleDto,
    @Req() req: any
  ) {
    return this.titleService.reversePayment(id, reverseDto, req.user);
  }
}
