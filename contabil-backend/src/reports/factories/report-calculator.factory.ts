import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { TrialBalanceCalculator } from '../calculators/trial-balance.calculator';
import { DRECalculator } from '../calculators/dre.calculator';
import { BalancoCalculator } from '../calculators/balanco.calculator';
import { LedgerCalculator } from '../calculators/ledger.calculator';
import { ReportType } from '../types/report-type.enum';

@Injectable()
export class ReportCalculatorFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  getCalculator(type: ReportType): IReportCalculator {
    let calculatorToken;

    switch (type) {
      case ReportType.TRIAL_BALANCE:
        calculatorToken = TrialBalanceCalculator;
        break;
      case ReportType.DRE:
        calculatorToken = DRECalculator;
        break;
      case ReportType.BALANCO:
        calculatorToken = BalancoCalculator;
        break;
      case ReportType.LEDGER:
        calculatorToken = LedgerCalculator;
        break;
      default:
        throw new Error('Invalid report type');
    }

    return this.moduleRef.get(calculatorToken, { strict: false });
  }
}
