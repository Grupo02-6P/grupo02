import { StatusUsers } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  status: StatusUsers;

  //opcional, padrão "USER"
  @IsNotEmpty()
  @IsString()
  roleId: string;
}
