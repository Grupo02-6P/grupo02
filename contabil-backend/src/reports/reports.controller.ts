import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Gerar relatório contábil',
    description: 'Gera relatórios como Balancete, DRE, Balanço Patrimonial em formato PDF ou CSV'
  })
  @ApiProduces('application/pdf', 'text/csv')
  @ApiResponse({ 
    status: 200, 
    description: 'Arquivo do relatório gerado',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async generateReport(
    @Body() generateReportDto: GenerateReportDto,
    @Res() res: Response,
  ) {
    const fileBuffer = await this.reportsService.generate(generateReportDto);

    let contentType = '';
    let fileExtension = '';
    if (generateReportDto.format === 'PDF') {
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    } else if (generateReportDto.format === 'CSV') {
      contentType = 'text/csv';
      fileExtension = 'csv';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio.${fileExtension}"`,
    );
    res.send(fileBuffer);
  }
}
