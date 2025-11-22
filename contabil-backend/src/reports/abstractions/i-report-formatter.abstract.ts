import { ReportData } from '../types/report-data.type';

export abstract class IReportFormatter {
  abstract format(data: ReportData): Promise<Buffer>;
}
