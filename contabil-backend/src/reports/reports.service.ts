import { Injectable } from '@nestjs/common';
import { ReportCalculatorFactory } from './factories/report-calculator.factory';
import { ReportFormatterFactory } from './factories/report-formatter.factory';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportCalculatorFactory: ReportCalculatorFactory,
    private readonly reportFormatterFactory: ReportFormatterFactory,
  ) {}

  async generate(dto: GenerateReportDto): Promise<Buffer> {
    const { type, startDate, endDate, accountId, format } = dto;

    const period = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    const options = { accountId };

    const calculator = this.reportCalculatorFactory.getCalculator(type);
    const reportData = await calculator.calculate(period, options);

    const formatter = this.reportFormatterFactory.getFormatter(format);
    const fileBuffer = await formatter.format(reportData);

    return fileBuffer;
  }
}
