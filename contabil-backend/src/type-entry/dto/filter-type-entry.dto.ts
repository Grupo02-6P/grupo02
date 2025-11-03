import { IsOptional, IsString } from "class-validator";
import { BaseFilterDto } from "src/common/dto/base-filter.dto";

export class FilterTypeEntryDto extends BaseFilterDto{
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    accountClearedId?: string
}