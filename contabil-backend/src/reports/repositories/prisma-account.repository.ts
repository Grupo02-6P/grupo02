import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { TrialBalanceLineDto } from '../dto/trial-balance-line.dto';

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTrialBalanceData(endDate: Date): Promise<TrialBalanceLineDto[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        acceptsPosting: true,
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              date: {
                lte: endDate,
              },
            },
          },
        },
      },
    });

    const trialBalance: TrialBalanceLineDto[] = accounts.map(account => {
      const totalDebit = account.journalLines
        .filter(line => line.type === 'DEBIT')
        .reduce((sum, line) => sum + line.amount, 0);

      const totalCredit = account.journalLines
        .filter(line => line.type === 'CREDIT')
        .reduce((sum, line) => sum + line.amount, 0);

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        totalDebit,
        totalCredit,
        balance: totalDebit - totalCredit,
      };
    });

    return trialBalance;
  }
}
