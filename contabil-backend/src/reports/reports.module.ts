import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TrialBalanceCalculator } from './calculators/trial-balance.calculator';
import { ReportCalculatorFactory } from './factories/report-calculator.factory';
import { IAccountRepository } from './abstractions/i-account-repository.abstract';
import { PrismaAccountRepository } from './repositories/prisma-account.repository';
import { DRECalculator } from './calculators/dre.calculator';
import { BalancoCalculator } from './calculators/balanco.calculator';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    TrialBalanceCalculator,
    DRECalculator,
    BalancoCalculator,
    ReportCalculatorFactory,
    {
      provide: IAccountRepository,
      useClass: PrismaAccountRepository,
    },
  ],
})
export class ReportsModule {}
