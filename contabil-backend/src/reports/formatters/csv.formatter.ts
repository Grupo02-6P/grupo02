import { Injectable } from '@nestjs/common';
import { IReportFormatter } from '../abstractions/i-report-formatter.abstract';
import { ReportData } from '../types/report-data.type';
import { unparse } from 'papaparse';
import { BalanceSheetReportDto } from '../dto/balance-sheet-report.dto';
import { DREReportDto } from '../dto/dre-report.dto';
import { LedgerReportDto } from '../dto/ledger-report.dto';

@Injectable()
export class CsvFormatter implements IReportFormatter {
  format(data: ReportData): Promise<Buffer> {
    let dataToParse: any[];

    switch (data.title) {
      case 'Balancete de Verificação':
        dataToParse = data.data;
        break;
      case 'Livro Razão':
        dataToParse = (data.data as LedgerReportDto).lines;
        break;
      case 'Demonstração do Resultado':
        const dreData = data.data as DREReportDto;
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
        const bsData = data.data as BalanceSheetReportDto;
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
        dataToParse = Array.isArray(data.data) ? data.data : [[data.data]];
    }

    const csvString = unparse(dataToParse);
    return Promise.resolve(Buffer.from(csvString, 'utf-8'));
  }
}
