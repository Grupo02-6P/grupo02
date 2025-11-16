import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from '../../common/dto/base-filter.dto';
import { Status } from '@prisma/client';

export class FilterAccountDto extends BaseFilterDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  level: number;

  @IsOptional()
  acceptsPosting: string;

  @IsOptional()
  active: Status;
}
