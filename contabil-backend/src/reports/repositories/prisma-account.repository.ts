import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { TrialBalanceLineDto } from '../dto/trial-balance-line.dto';
import { DateRange } from '../types/date-range.type';
import { JournalLine } from '@prisma/client';

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

  async getAccountBalanceBefore(
    accountId: string,
    startDate: Date,
  ): Promise<number> {
    const debits = await this.prisma.journalLine.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        accountId,
        type: 'DEBIT',
        journalEntry: {
          date: {
            lt: startDate,
          },
        },
      },
    });

    const credits = await this.prisma.journalLine.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        accountId,
        type: 'CREDIT',
        journalEntry: {
          date: {
            lt: startDate,
          },
        },
      },
    });

    const totalDebit = debits._sum.amount || 0;
    const totalCredit = credits._sum.amount || 0;

    return totalDebit - totalCredit;
  }

  async getDetailedAccountLines(
    accountId: string,
    period: DateRange,
  ): Promise<JournalLine[]> {
    return this.prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: {
          date: {
            gte: period.startDate,
            lte: period.endDate,
          },
        },
      },
      orderBy: {
        journalEntry: {
          date: 'asc',
        },
      },
      include: {
        account: true,
        journalEntry: {
          include: {
            tittle: {
              select: {
                description: true,
              },
            },
            entry: {
              select: {
                description: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllAccountsByRoot(rootCodes: string[]): Promise<any[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        OR: rootCodes.map(code => ({
          code: {
            startsWith: code,
          },
        })),
      },
      orderBy: {
        code: 'asc',
      },
    });
    return accounts;
  }
}
