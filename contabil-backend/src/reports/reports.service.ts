import { Injectable } from '@nestjs/common';
import { ReportCalculatorFactory } from './factories/report-calculator.factory';
import { DateRange } from './types/date-range.type';
import { ReportType } from './types/report-type.enum';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportCalculatorFactory: ReportCalculatorFactory,
  ) {}

  async generateReport(
    type: ReportType,
    period: DateRange,
    options?: { accountId?: string },
  ) {
    const calculator = this.reportCalculatorFactory.getCalculator(type);
    return calculator.calculate(period, options);
  }
}
