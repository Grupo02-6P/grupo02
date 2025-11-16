import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';

export abstract class IReportCalculator {
  abstract calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData>;
}
