import { TrialBalanceLineDto } from '../dto/trial-balance-line.dto';

export abstract class IAccountRepository {
  abstract getTrialBalanceData(endDate: Date): Promise<TrialBalanceLineDto[]>;
}
