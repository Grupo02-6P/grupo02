import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IReportFormatter } from '../abstractions/i-report-formatter.abstract';
import { FormatType } from '../types/format-type.enum';
import { PdfFormatter } from '../formatters/pdf.formatter';
import { CsvFormatter } from '../formatters/csv.formatter';

@Injectable()
export class ReportFormatterFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  getFormatter(type: FormatType): IReportFormatter {
    let formatterToken;

    switch (type) {
      case FormatType.PDF:
        formatterToken = PdfFormatter;
        break;
      case FormatType.CSV:
        formatterToken = CsvFormatter;
        break;
      default:
        throw new Error('Invalid format type');
    }

    return this.moduleRef.get(formatterToken, { strict: false });
  }
}
