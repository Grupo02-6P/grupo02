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
  titleId?: string;

  @IsOptional()
  @IsString()
  entryId?: string;
}
