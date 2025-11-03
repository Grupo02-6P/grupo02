import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeEntryDto } from './create-type-entry.dto';

export class UpdateTypeEntryDto extends PartialType(CreateTypeEntryDto) {}
