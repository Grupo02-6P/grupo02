import { Body, Controller, Post } from '@nestjs/common';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  generateReport(@Body() generateReportDto: GenerateReportDto) {
    const { type, startDate, endDate, accountId } = generateReportDto;
    const period = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    const options = { accountId };
    return this.reportsService.generateReport(type, period, options);
  }
}
