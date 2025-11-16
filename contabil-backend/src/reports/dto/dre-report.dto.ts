export class DRELineDto {
  accountCode: string;
  accountName: string;
  balance: number;
  isSynthetic: boolean;
  children: DRELineDto[];
}

export class DREReportDto {
  totalReceitas: number;
  totalDespesas: number;
  lucroPrejuizo: number;
  treeReceitas: DRELineDto;
  treeDespesas: DRELineDto;
}
