import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTitleDto {
  @ApiProperty({
    description: 'Código único do título',
    example: 'TIT-001-2025'
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Descrição do título',
    example: 'Pagamento de fornecedor XYZ',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Data do título',
    example: '2025-11-21',
    format: 'date',
    required: false
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'Valor do título',
    example: 1500.50,
    minimum: 0.01
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Status do título',
    enum: ['ACTIVE', 'INACTIVE', 'PAID'],
    example: 'ACTIVE',
    required: false
  })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'PAID';

  @ApiProperty({
    description: 'ID do tipo de movimento contábil',
    example: 'uuid-do-tipo-movimento'
  })
  @IsUUID()
  movementId: string;

  @ApiProperty({
    description: 'ID do tipo de entrada/baixa',
    example: 'uuid-do-tipo-entrada',
    required: false
  })
  @IsUUID()
  typeEntryId?: string;

  @ApiProperty({
    description: 'ID do parceiro (cliente/fornecedor)',
    example: 'uuid-do-parceiro',
    required: false
  })
  @IsOptional()
  @IsUUID()
  partnerId?: string;
}
