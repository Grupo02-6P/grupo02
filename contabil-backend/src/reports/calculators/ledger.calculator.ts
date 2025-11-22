import { Injectable, BadRequestException } from '@nestjs/common';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';
import { LedgerReportDto, LedgerLineDto } from '../dto/ledger-report.dto';

@Injectable()
export class LedgerCalculator implements IReportCalculator {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData> {
    if (!options?.accountId) {
      throw new BadRequestException(
        'O accountId é obrigatório para o Livro Razão',
      );
    }

    const accountId = options.accountId;

    const initialBalance = await this.accountRepo.getAccountBalanceBefore(
      accountId,
      period.startDate,
    );

    const journalLines = await this.accountRepo.getDetailedAccountLines(
      accountId,
      period,
    );

    const linhasDto: LedgerLineDto[] = [];
    let runningBalance = initialBalance;

    for (const line of journalLines) {
      const debit = line.type === 'DEBIT' ? line.amount : 0;
      const credit = line.type === 'CREDIT' ? line.amount : 0;
      runningBalance += debit - credit;

      const description =
        (line as any).journalEntry.tittle?.description ||
        (line as any).journalEntry.entry?.description ||
        '';

      linhasDto.push({
        date: (line as any).journalEntry.date,
        description,
        debit,
        credit,
        runningBalance,
      });
    }

    const accountInfo = journalLines.length > 0 ? (journalLines[0] as any).account : null;

    const ledgerReportDto: LedgerReportDto = {
      accountName: accountInfo?.name || '',
      accountCode: accountInfo?.code || '',
      initialBalance,
      finalBalance: runningBalance,
      lines: linhasDto,
    };

    return {
      title: 'Livro Razão',
      data: ledgerReportDto,
      period,
    };
  }
}
