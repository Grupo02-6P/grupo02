import { Status } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty({
    description: 'Nome do parceiro (razão social)',
    example: 'Empresa Fornecedora LTDA'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Endereço completo do parceiro',
    example: 'Rua das Flores, 123 - Centro - São Paulo/SP'
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'CNPJ do parceiro',
    example: '12.345.678/0001-90'
  })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({
    description: 'Status do parceiro',
    enum: Status,
    example: Status.ACTIVE,
    required: false
  })
  @IsOptional()
  status?: Status;
}
