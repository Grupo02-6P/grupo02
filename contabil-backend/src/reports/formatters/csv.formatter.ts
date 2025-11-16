import { Injectable } from '@nestjs/common';
import { IReportFormatter } from '../abstractions/i-report-formatter.abstract';
import { ReportData } from '../types/report-data.type';
import { unparse } from 'papaparse';
import { BalanceSheetReportDto } from '../dto/balance-sheet-report.dto';
import { DREReportDto } from '../dto/dre-report.dto';
import { LedgerReportDto } from '../dto/ledger-report.dto';
import { TrialBalanceReportLineDto } from '../dto/trial-balance-report-line.dto';

@Injectable()
export class CsvFormatter implements IReportFormatter {
  format(reportData: ReportData): Promise<Buffer> {
    let dataToParse: any[];

    switch (reportData.title) {
      case 'Balancete de Verificação':
        const trialBalanceData = reportData.data as TrialBalanceReportLineDto[];
        dataToParse = trialBalanceData.map(l => ({
          'Código': l.accountCode,
          'Conta': l.accountName,
          'Débito': l.totalDebit,
          'Crédito': l.totalCredit,
          'S. Devedor': l.saldoDevedor,
          'S. Credor': l.saldoCredor,
        }));
        break;
      case 'Livro Razão':
        dataToParse = (reportData.data as LedgerReportDto).lines;
        break;
      case 'Demonstração do Resultado':
        const dreData = reportData.data as DREReportDto;
        dataToParse = [
          ['Grupo', 'Valor'],
          ['Total Receitas', dreData.totalReceitas],
          ['Total Despesas', dreData.totalDespesas],
          ['Lucro/Prejuízo', dreData.lucroPrejuizo],
          [],
          ['--- Receitas ---'],
          ...dreData.linhasReceita.map(l => [l.accountName, l.balance]),
          [],
          ['--- Despesas ---'],
          ...dreData.linhasDespesa.map(l => [l.accountName, l.balance]),
        ];
        break;
      case 'Balanço Patrimonial':
        const bsData = reportData.data as BalanceSheetReportDto;
        dataToParse = [
            ['Grupo', 'Valor'],
            ['Total Ativo', bsData.totalAtivo],
            ['Total Passivo', bsData.totalPassivo],
            ['Total Patrimônio Líquido', bsData.totalPatrimonioLiquido],
            [],
            ['--- Ativo ---'],
            ...bsData.linhasAtivo.map(l => [l.accountName, l.balance]),
            [],
            ['--- Passivo ---'],
            ...bsData.linhasPassivo.map(l => [l.accountName, l.balance]),
            [],
            ['--- Patrimônio Líquido ---'],
            ...bsData.linhasPatrimonioLiquido.map(l => [l.accountName, l.balance]),
        ];
        break;
      default:
        // Fallback for simple array data
        dataToParse = Array.isArray(reportData.data) ? reportData.data : [[reportData.data]];
    }

    const startDate = new Date(reportData.period.startDate).toLocaleDateString(
      'pt-BR',
    );
    const endDate = new Date(reportData.period.endDate).toLocaleDateString('pt-BR');
    dataToParse.unshift(['Período:', `${startDate} a ${endDate}`]);
    dataToParse.unshift(['Relatório:', reportData.title]);
    dataToParse.push([]); // Linha em branco

    const csvString = unparse(dataToParse);
    return Promise.resolve(Buffer.from(csvString, 'utf-8'));
  }
}
