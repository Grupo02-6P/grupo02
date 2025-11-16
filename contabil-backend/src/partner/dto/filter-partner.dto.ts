import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from '../../common/dto/base-filter.dto';

export class FilterPartnerDto extends BaseFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  companyId?: string;
}
