import { Injectable } from '@nestjs/common';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';

@Injectable()
export class TrialBalanceCalculator implements IReportCalculator {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData> {
    const trialBalanceData = await this.accountRepo.getTrialBalanceData(
      period.endDate,
    );

    return {
      title: 'Balancete de Verificação',
      data: trialBalanceData,
    };
  }
}
