export class LedgerLineDto {
  date: Date;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export class LedgerReportDto {
  accountName: string;
  accountCode: string;
  initialBalance: number;
  finalBalance: number;
  lines: LedgerLineDto[];
}
