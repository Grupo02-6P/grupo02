import { Body, Controller, Post, Res } from '@nestjs/common';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
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
