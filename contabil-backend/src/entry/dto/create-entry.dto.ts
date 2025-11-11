import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateEntryDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsString()
  tittleId: string;

  @IsString()
  entryTypeId: string;
}
