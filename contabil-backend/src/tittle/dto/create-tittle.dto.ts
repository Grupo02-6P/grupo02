import { IsString, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateTittleDto {
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
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE';

  @IsUUID()
  movementId: string;

  @IsOptional()
  @IsUUID()
  partnerId?: string;
}
