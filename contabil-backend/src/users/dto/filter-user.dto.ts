import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from '../../common/dto/base-filter.dto';
import { Role } from '@prisma/client';

export class FilterUserDto extends BaseFilterDto {
  // Filtros específicos para User
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

}