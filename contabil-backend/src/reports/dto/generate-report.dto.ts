import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReportType } from '../types/report-type.enum';
import { FormatType } from '../types/format-type.enum';

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(FormatType)
  format: FormatType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;
}
