// account.controller.ts
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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FilterAccountDto } from './dto/filter-account.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta contábil' })
  @ApiResponse({ 
    status: 201, 
    description: 'Conta criada com sucesso'
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas contábeis com filtros' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de contas contábeis'
  })
  findAll(@Query() filterDto: FilterAccountDto) {
    return this.accountService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  @ApiParam({ name: 'id', description: 'ID da conta contábil' })
  @ApiResponse({ status: 200, description: 'Conta encontrada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta contábil' })
  @ApiParam({ name: 'id', description: 'ID da conta contábil' })
  @ApiResponse({ status: 200, description: 'Conta atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover conta contábil' })
  @ApiParam({ name: 'id', description: 'ID da conta contábil' })
  @ApiResponse({ status: 200, description: 'Conta removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar conta contábil' })
  @ApiParam({ name: 'id', description: 'ID da conta contábil' })
  @ApiResponse({ status: 200, description: 'Conta inativada com sucesso' })
  inactive(@Param('id') id: string) {
    return this.accountService.inactivate(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obter saldo da conta contábil' })
  @ApiParam({ name: 'id', description: 'ID da conta contábil' })
  @ApiResponse({ 
    status: 200, 
    description: 'Saldo da conta',
    example: {
      accountId: 'uuid',
      balance: 1000.50,
      lastUpdate: '2025-11-21T10:30:00Z'
    }
  })
  getBalance(@Param('id') id: string) {
    return this.accountService.getAccountBalance(id);
  }
}
