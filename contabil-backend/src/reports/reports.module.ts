import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TrialBalanceCalculator } from './calculators/trial-balance.calculator';
import { ReportCalculatorFactory } from './factories/report-calculator.factory';
import { IAccountRepository } from './abstractions/i-account-repository.abstract';
import { PrismaAccountRepository } from './repositories/prisma-account.repository';
import { DRECalculator } from './calculators/dre.calculator';
import { BalancoCalculator } from './calculators/balanco.calculator';
import { LedgerCalculator } from './calculators/ledger.calculator';
import { ReportFormatterFactory } from './factories/report-formatter.factory';
import { PdfFormatter } from './formatters/pdf.formatter';
import { CsvFormatter } from './formatters/csv.formatter';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    TrialBalanceCalculator,
    DRECalculator,
    BalancoCalculator,
    LedgerCalculator,
    ReportCalculatorFactory,
    ReportFormatterFactory,
    PdfFormatter,
    CsvFormatter,
    {
      provide: IAccountRepository,
      useClass: PrismaAccountRepository,
    },
  ],
})
export class ReportsModule {}
