import { PartialType } from '@nestjs/mapped-types';
import { CreateTittleDto } from './create-tittle.dto';

export class UpdateTittleDto extends PartialType(CreateTittleDto) {}
