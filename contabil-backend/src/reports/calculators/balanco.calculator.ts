import { Injectable } from '@nestjs/common';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';
import { DRECalculator } from './dre.calculator';
import {
  BalanceSheetReportDto,
  BalanceSheetLineDto,
} from '../dto/balance-sheet-report.dto';
import { DREReportDto } from '../dto/dre-report.dto';

@Injectable()
export class BalancoCalculator implements IReportCalculator {
  constructor(
    private readonly accountRepo: IAccountRepository,
    private readonly dreCalculator: DRECalculator,
  ) {}

  async calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData> {
    // 1. Calcular o resultado do período
    const dreReportData = await this.dreCalculator.calculate(period);
    const lucroPrejuizo = (dreReportData.data as DREReportDto).lucroPrejuizo;

    // 2. Buscar os saldos patrimoniais
    const trialBalanceData = await this.accountRepo.getTrialBalanceData(
      period.endDate,
    );

    // 3. Inicializar o DTO do Balanço
    const balanceSheetReport: BalanceSheetReportDto = {
      totalAtivo: 0,
      totalPassivo: 0,
      totalPatrimonioLiquido: 0,
      linhasAtivo: [],
      linhasPassivo: [],
      linhasPatrimonioLiquido: [],
    };

    // 4. Processar as contas do balancete
    for (const line of trialBalanceData) {
      if (line.accountCode.startsWith('1')) {
        // Ativo (saldo devedor/positivo)
        balanceSheetReport.totalAtivo += line.balance;
        balanceSheetReport.linhasAtivo.push({
          accountCode: line.accountCode,
          accountName: line.accountName,
          balance: line.balance,
        });
      } else if (line.accountCode.startsWith('2')) {
        // Passivo (saldo credor/negativo)
        const balance = line.balance * -1;
        balanceSheetReport.totalPassivo += balance;
        balanceSheetReport.linhasPassivo.push({
          accountCode: line.accountCode,
          accountName: line.accountName,
          balance,
        });
      } else if (line.accountCode.startsWith('3')) {
        // Patrimônio Líquido (saldo credor/negativo)
        const balance = line.balance * -1;
        balanceSheetReport.totalPatrimonioLiquido += balance;
        balanceSheetReport.linhasPatrimonioLiquido.push({
          accountCode: line.accountCode,
          accountName: line.accountName,
          balance,
        });
      }
    }

    // 5. Adicionar o resultado do período ao PL
    balanceSheetReport.totalPatrimonioLiquido += lucroPrejuizo;
    balanceSheetReport.linhasPatrimonioLiquido.push({
      accountCode: '3.99',
      accountName: 'Resultado do Período',
      balance: lucroPrejuizo,
    });

    // 6. Retornar o ReportData
    return {
      title: 'Balanço Patrimonial',
      data: balanceSheetReport,
    };
  }
}
