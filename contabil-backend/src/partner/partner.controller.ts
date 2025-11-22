import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { FilterPartnerDto } from './dto/filter-partner.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('partners')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo parceiro (cliente/fornecedor)' })
  @ApiResponse({ status: 201, description: 'Parceiro criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.create(createPartnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar parceiros com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de parceiros' })
  findAll(@Query() filterDto: FilterPartnerDto, @Req() req) {
    const user = req.user;
    const companyId = user.companyId;
    if (companyId && user.role.name !== 'ADMIN') {
      filterDto.companyId = companyId;
    }
    return this.partnerService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar parceiro por ID' })
  @ApiParam({ name: 'id', description: 'ID do parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro encontrado' })
  @ApiResponse({ status: 404, description: 'Parceiro não encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    const user = req.user;
    const companyId = user.companyId;
    if (companyId && user.role.name !== 'ADMIN') {
      return this.partnerService.findOne(id, companyId);
    }
    return this.partnerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar parceiro' })
  @ApiParam({ name: 'id', description: 'ID do parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnerService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover parceiro' })
  @ApiParam({ name: 'id', description: 'ID do parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro removido com sucesso' })
  remove(@Param('id') id: string, @Req() req) {
    const user = req.user;
    const companyId = user.companyId;
    if (companyId && user.role.name !== 'ADMIN') {
      return this.partnerService.remove(id, companyId);
    }
    return this.partnerService.remove(id);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar parceiro' })
  @ApiParam({ name: 'id', description: 'ID do parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro inativado com sucesso' })
  inactive(@Param('id') id: string) {
    return this.partnerService.inactivate(id);
  }
}
