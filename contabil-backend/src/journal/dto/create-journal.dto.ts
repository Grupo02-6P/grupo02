import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateJournalDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  originType?: string;

  @IsOptional()
  @IsString()
  originId?: string;

  @IsOptional()
  @IsString()
  tittleId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;
}
