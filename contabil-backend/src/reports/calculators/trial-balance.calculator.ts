import { Injectable } from '@nestjs/common';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';
import { TrialBalanceLineDto } from '../dto/trial-balance-line.dto';
import { TrialBalanceReportLineDto } from '../dto/trial-balance-report-line.dto';

@Injectable()
export class TrialBalanceCalculator implements IReportCalculator {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData> {
    const dadosBrutos: TrialBalanceLineDto[] =
      await this.accountRepo.getTrialBalanceData(period.endDate);

    let totalDebitoGeral = 0;
    let totalCreditoGeral = 0;

    const dadosTratados: TrialBalanceReportLineDto[] = dadosBrutos.map(
      (linha) => {
        totalDebitoGeral += linha.totalDebit;
        totalCreditoGeral += linha.totalCredit;

        const balance = linha.balance;
        const saldoDevedor = balance > 0 ? balance : 0;
        const saldoCredor = balance < 0 ? balance * -1 : 0;

        return {
          accountCode: linha.accountCode,
          accountName: linha.accountName,
          totalDebit: linha.totalDebit,
          totalCredit: linha.totalCredit,
          saldoDevedor,
          saldoCredor,
        };
      },
    );

    const totalSaldoDevedor = dadosTratados.reduce(
      (acc, l) => acc + l.saldoDevedor,
      0,
    );
    const totalSaldoCredor = dadosTratados.reduce(
      (acc, l) => acc + l.saldoCredor,
      0,
    );

    dadosTratados.push({
      accountCode: '',
      accountName: 'TOTAIS',
      totalDebit: totalDebitoGeral,
      totalCredit: totalCreditoGeral,
      saldoDevedor: totalSaldoDevedor,
      saldoCredor: totalSaldoCredor,
    });

    return {
      title: 'Balancete de Verificação',
      data: dadosTratados,
    };
  }
}
