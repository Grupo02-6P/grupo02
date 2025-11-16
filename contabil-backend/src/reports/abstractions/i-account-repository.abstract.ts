import { TrialBalanceLineDto } from '../dto/trial-balance-line.dto';
import { DateRange } from '../types/date-range.type';
import { JournalLine, Account } from '@prisma/client';

export abstract class IAccountRepository {
  abstract getTrialBalanceData(endDate: Date): Promise<TrialBalanceLineDto[]>;
  abstract getAccountBalanceBefore(
    accountId: string,
    startDate: Date,
  ): Promise<number>;
  abstract getDetailedAccountLines(
    accountId: string,
    period: DateRange,
  ): Promise<JournalLine[]>;
  abstract getAllAccountsByRoot(rootCodes: string[]): Promise<Account[]>;
}
