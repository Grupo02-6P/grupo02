export class DRELineDto {
  accountCode: string;
  accountName: string;
  balance: number;
}

export class DREReportDto {
  totalReceitas: number;
  totalDespesas: number;
  lucroPrejuizo: number;
  linhasReceita: DRELineDto[];
  linhasDespesa: DRELineDto[];
}
