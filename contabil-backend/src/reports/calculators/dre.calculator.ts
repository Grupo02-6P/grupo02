import { Injectable } from '@nestjs/common';
import { IReportCalculator } from '../abstractions/i-report-calculator.abstract';
import { IAccountRepository } from '../abstractions/i-account-repository.abstract';
import { DateRange } from '../types/date-range.type';
import { ReportData } from '../types/report-data.type';
import { DREReportDto, DRELineDto } from '../dto/dre-report.dto';
import { Account } from '@prisma/client';
import { TrialBalanceLineDto } from '../dto/trial-balance-line.dto';

@Injectable()
export class DRECalculator implements IReportCalculator {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async calculate(
    period: DateRange,
    options?: { accountId?: string },
  ): Promise<ReportData> {
    const [trialBalanceData, allAccounts] = await Promise.all([
      this.accountRepo.getTrialBalanceData(period.endDate),
      this.accountRepo.getAllAccountsByRoot(['4', '5']),
    ]);

    const { treeReceitas, treeDespesas } = this.buildTree(
      allAccounts,
      trialBalanceData,
    );

    const totalReceitas = treeReceitas?.balance || 0;
    const totalDespesas = treeDespesas?.balance || 0;
    const lucroPrejuizo = totalReceitas - totalDespesas;

    const dreReport: DREReportDto = {
      totalReceitas,
      totalDespesas,
      lucroPrejuizo,
      treeReceitas: treeReceitas || this.createEmptyTreeNode('4', 'RECEITAS'),
      treeDespesas: treeDespesas || this.createEmptyTreeNode('5', 'DESPESAS'),
    };

    return {
      title: 'Demonstração do Resultado',
      data: dreReport,
      period,
    };
  }

  private buildTree(
    allAccounts: Account[],
    balances: TrialBalanceLineDto[],
  ): { treeReceitas: DRELineDto | null; treeDespesas: DRELineDto | null } {
    const map = new Map<string, DRELineDto & { parentId: string | null }>();

    // 1. Create nodes for all accounts
    for (const acc of allAccounts) {
      map.set(acc.id, {
        accountCode: acc.code,
        accountName: acc.name,
        balance: 0,
        isSynthetic: !acc.acceptsPosting,
        children: [],
        parentId: acc.parentAccountId,
      });
    }

    // 2. Populate balances for analytic accounts
    for (const balanceLine of balances) {
      const node = map.get(balanceLine.accountId);
      if (node) {
        const isReceita = node.accountCode.startsWith('4');
        // Receitas têm saldo credor (negativo no balancete), então invertemos.
        node.balance = isReceita ? balanceLine.balance * -1 : balanceLine.balance;
      }
    }

    // 3. Link children to parents
    const roots: DRELineDto[] = [];
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        // Root nodes (e.g., '4' and '5')
        roots.push(node);
      }
    }

    // 4. Calculate rollup totals for synthetic accounts
    const calculateRollup = (node: DRELineDto): number => {
      if (!node.isSynthetic) {
        return node.balance;
      }
      const childrenSum = node.children.reduce(
        (sum, child) => sum + calculateRollup(child),
        0,
      );
      node.balance = childrenSum;
      return node.balance;
    };

    roots.forEach(calculateRollup);

    const treeReceitas = roots.find(r => r.accountCode === '4') || null;
    const treeDespesas = roots.find(r => r.accountCode === '5') || null;

    return { treeReceitas, treeDespesas };
  }

  private createEmptyTreeNode(code: string, name: string): DRELineDto {
    return {
      accountCode: code,
      accountName: name,
      balance: 0,
      isSynthetic: true,
      children: [],
    };
  }
}
