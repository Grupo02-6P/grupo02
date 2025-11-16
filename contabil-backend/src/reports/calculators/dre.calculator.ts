import { Injectable } from '@nestjs/common';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';
import { DREReportDto, DRELineDto } from '../dto/dre-report.dto';

@Injectable()
export class DRECalculator implements IReportCalculator {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData> {
    // A DRE considera o resultado dentro de um período, mas a lógica pedida
    // usa o saldo final. Para uma DRE correta, precisaríamos dos saldos inicial e final.
    // Vou implementar conforme solicitado, usando o saldo final do balancete.
    const trialBalanceData = await this.accountRepo.getTrialBalanceData(
      period.endDate,
    );

    const dreReport: DREReportDto = {
      totalReceitas: 0,
      totalDespesas: 0,
      lucroPrejuizo: 0,
      linhasReceita: [],
      linhasDespesa: [],
    };

    for (const line of trialBalanceData) {
      if (line.accountCode.startsWith('4')) {
        // Receitas têm saldo credor (negativo no balancete)
        const balance = line.balance * -1;
        dreReport.totalReceitas += balance;
        dreReport.linhasReceita.push({
          accountCode: line.accountCode,
          accountName: line.accountName,
          balance,
        });
      } else if (line.accountCode.startsWith('5')) {
        // Despesas têm saldo devedor (positivo no balancete)
        const balance = line.balance;
        dreReport.totalDespesas += balance;
        dreReport.linhasDespesa.push({
          accountCode: line.accountCode,
          accountName: line.accountName,
          balance,
        });
      }
    }

    dreReport.lucroPrejuizo =
      dreReport.totalReceitas - dreReport.totalDespesas;

    return {
      title: 'Demonstração do Resultado',
      data: dreReport,
      period,
    };
  }
}
