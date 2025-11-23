import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReverseTitleDto {
  @ApiProperty({ description: 'Justificativa para o estorno', example: 'Baixa lançada indevidamente' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  justification: string;
}