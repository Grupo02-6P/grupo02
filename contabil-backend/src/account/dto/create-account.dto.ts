import { Status } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Código da conta contábil',
    example: '1.01.001',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Nome da conta contábil',
    example: 'Caixa',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada da conta',
    example: 'Conta para controle de dinheiro em caixa'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Nível hierárquico da conta',
    example: 3,
    minimum: 1
  })
  @IsNotEmpty()
  level: number;

  @ApiProperty({
    description: 'Indica se a conta aceita lançamentos diretos',
    example: true
  })
  @IsNotEmpty()
  acceptsPosting: boolean;

  @ApiProperty({
    description: 'Status da conta',
    enum: Status,
    example: Status.ACTIVE
  })
  @IsNotEmpty()
  active: Status;

  @ApiProperty({
    description: 'ID da conta pai (para contas filhas)',
    example: 'uuid-da-conta-pai',
    nullable: true,
    required: false
  })
  @IsString()
  @IsOptional()
  parentAccountId?: string | null;
}
