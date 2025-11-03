import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from '../../common/dto/base-filter.dto';

export class FilterTypeMovementDto extends BaseFilterDto {
  // Filtros específicos para TypeMovement
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  creditAccountId?: string;

  @IsOptional()
  @IsString()
  debitAccountId?: string;
}