import { Injectable } from '@nestjs/common';
import { IReportFormatter } from '../abstractions/i-report-formatter.abstract';
import { ReportData } from '../types/report-data.type';
import { TrialBalanceReportLineDto } from '../dto/trial-balance-report-line.dto';
import { DREReportDto } from '../dto/dre-report.dto';
import { BalanceSheetReportDto } from '../dto/balance-sheet-report.dto';
import { LedgerReportDto } from '../dto/ledger-report.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocumentWithTables = require('pdfkit-table');

@Injectable()
export class PdfFormatter implements IReportFormatter {
  async format(reportData: ReportData): Promise<Buffer> {
    const buildPdf = (
      reportData: ReportData,
      done: (buffer: Buffer) => void,
    ) => {
      const doc = new PDFDocumentWithTables({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        done(Buffer.concat(buffers));
      });

      // Adiciona o Título
      doc.fontSize(18).text(reportData.title, { align: 'center' });
      // Formata e adiciona o Período
      const startDate = new Date(reportData.period.startDate).toLocaleDateString(
        'pt-BR',
      );
      const endDate = new Date(reportData.period.endDate).toLocaleDateString(
        'pt-BR',
      );
      doc
        .fontSize(10)
        .text(`Período: ${startDate} a ${endDate}`, { align: 'center' });
      doc.moveDown(2); // Adiciona um espaço extra

      // Chama o desenhador específico
      switch (reportData.title) {
        case 'Balancete de Verificação':
          this._drawBalancete(doc, reportData.data);
          break;
        case 'Demonstração do Resultado':
          this._drawDRE(doc, reportData.data);
          break;
        case 'Balanço Patrimonial':
          this._drawBalanco(doc, reportData.data);
          break;
        case 'Livro Razão':
          this._drawRazao(doc, reportData.data);
          break;
        default:
          doc.text('Erro: Formato de relatório desconhecido.');
      }

      // Finaliza o documento
      doc.end();
    };

    return new Promise(resolve => {
      buildPdf(reportData, buffer => {
        resolve(buffer);
      });
    });
  }

  private _drawBalancete(doc: any, data: TrialBalanceReportLineDto[]) {
    const formatBRL = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const table = {
      headers: [
        'Cód.',
        'Conta',
        'Débito',
        'Crédito',
        'S. Devedor',
        'S. Credor',
      ],
      rows: data.map(linha => [
        linha.accountCode,
        linha.accountName,
        formatBRL(linha.totalDebit),
        formatBRL(linha.totalCredit),
        formatBRL(linha.saldoDevedor),
        formatBRL(linha.saldoCredor),
      ]),
    };

    doc.table(table, {
      width: 550,
      columnsSize: [60, 200, 70, 70, 70, 70],
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10),
    });
  }
  private _drawDRE(doc: any, data: DREReportDto) {
    const formatBRL = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const tableOptions = {
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10),
      width: 550,
    };

    // Resumo
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total de Receitas: ${formatBRL(data.totalReceitas)}`);
    doc.text(`Total de Despesas: ${formatBRL(data.totalDespesas)}`);
    doc.text(`Lucro/Prejuízo do Período: ${formatBRL(data.lucroPrejuizo)}`);
    doc.moveDown(2);

    // Tabela de Receitas
    const receitaTable = {
      title: 'Receitas',
      headers: ['Código', 'Conta', 'Saldo'],
      rows: data.linhasReceita.map(linha => [
        linha.accountCode,
        linha.accountName,
        formatBRL(linha.balance),
      ]),
    };
    doc.table(receitaTable, tableOptions);
    doc.moveDown();

    // Tabela de Despesas
    const despesaTable = {
      title: 'Despesas',
      headers: ['Código', 'Conta', 'Saldo'],
      rows: data.linhasDespesa.map(linha => [
        linha.accountCode,
        linha.accountName,
        formatBRL(linha.balance),
      ]),
    };
    doc.table(despesaTable, tableOptions);
  }
  private _drawBalanco(doc: any, data: BalanceSheetReportDto) {
    const formatBRL = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const tableOptions = {
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10),
      width: 550,
    };

    // Resumo
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total do Ativo: ${formatBRL(data.totalAtivo)}`);
    doc.text(`Total do Passivo: ${formatBRL(data.totalPassivo)}`);
    doc.text(
      `Total do Patrimônio Líquido: ${formatBRL(data.totalPatrimonioLiquido)}`,
    );
    doc.moveDown(2);

    // Tabela de Ativos
    const ativoTable = {
      title: 'Ativo',
      headers: ['Conta', 'Saldo'],
      rows: data.linhasAtivo.map(linha => [
        linha.accountName,
        formatBRL(linha.balance),
      ]),
    };
    doc.table(ativoTable, tableOptions);
    doc.moveDown();

    // Tabela de Passivos
    const passivoTable = {
      title: 'Passivo',
      headers: ['Conta', 'Saldo'],
      rows: data.linhasPassivo.map(linha => [
        linha.accountName,
        formatBRL(linha.balance),
      ]),
    };
    doc.table(passivoTable, tableOptions);
    doc.moveDown();

    // Tabela de Patrimônio Líquido
    const plTable = {
      title: 'Patrimônio Líquido',
      headers: ['Conta', 'Saldo'],
      rows: data.linhasPatrimonioLiquido.map(linha => [
        linha.accountName,
        formatBRL(linha.balance),
      ]),
    };
    doc.table(plTable, tableOptions);
  }
  private _drawRazao(doc: any, data: LedgerReportDto) {
    const formatBRL = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR');

    // Resumo
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Conta: ${data.accountName} (${data.accountCode})`);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Saldo Inicial: ${formatBRL(data.initialBalance)}`);
    doc.text(`Saldo Final: ${formatBRL(data.finalBalance)}`);
    doc.moveDown(2);

    // Tabela de Movimentações
    const table = {
      headers: ['Data', 'Descrição', 'Débito', 'Crédito', 'Saldo'],
      rows: data.lines.map(linha => [
        formatDate(linha.date),
        linha.description,
        formatBRL(linha.debit),
        formatBRL(linha.credit),
        formatBRL(linha.runningBalance),
      ]),
    };

    doc.table(table, {
      width: 550,
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10),
    });
  }
}
