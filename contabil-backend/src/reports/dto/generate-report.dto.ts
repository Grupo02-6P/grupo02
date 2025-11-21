import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType } from '../types/report-type.enum';
import { FormatType } from '../types/format-type.enum';

export class GenerateReportDto {
  @ApiProperty({
    description: 'Tipo do relatório a ser gerado',
    enum: ReportType,
    example: ReportType.DRE
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: 'Formato de saída do relatório',
    enum: FormatType,
    example: FormatType.PDF
  })
  @IsEnum(FormatType)
  format: FormatType;

  @ApiProperty({
    description: 'Data inicial do período do relatório',
    example: '2025-01-01',
    format: 'date'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Data final do período do relatório',
    example: '2025-12-31',
    format: 'date'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'ID da conta específica (opcional, para relatórios filtrados)',
    example: 'uuid-da-conta',
    required: false
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;
}
