export class BalanceSheetLineDto {
  accountCode: string;
  accountName: string;
  balance: number;
}

export class BalanceSheetReportDto {
  totalAtivo: number;
  totalPassivo: number;
  totalPatrimonioLiquido: number;
  linhasAtivo: BalanceSheetLineDto[];
  linhasPassivo: BalanceSheetLineDto[];
  linhasPatrimonioLiquido: BalanceSheetLineDto[];
}
