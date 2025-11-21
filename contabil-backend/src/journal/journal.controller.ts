import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JournalService } from './journal.service';

@ApiTags('journals')
@Controller('journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os lançamentos do diário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de lançamentos do diário',
    example: [{
      id: 'uuid',
      date: '2025-11-21T00:00:00Z',
      originType: 'TITLE',
      lines: [{
        account: { code: '1.01.001', name: 'Caixa' },
        type: 'DEBIT',
        amount: 1000
      }]
    }]
  })
  findAll() {
    return this.journalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lançamento do diário por ID' })
  @ApiParam({ name: 'id', description: 'ID do lançamento' })
  @ApiResponse({ status: 200, description: 'Lançamento encontrado' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.journalService.findOne(id);
  }
}
