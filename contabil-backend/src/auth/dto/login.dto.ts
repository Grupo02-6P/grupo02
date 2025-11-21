import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario@exemplo.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'minhasenha123',
    minLength: 5
  })
  @IsString()
  @MinLength(5)
  password: string;
}
