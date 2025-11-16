import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReportType } from '../types/report-type.enum';

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;
}
