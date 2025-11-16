import { IsArray, IsBoolean, IsString } from 'class-validator';

export type permissionsType = {
  resource: string;
  action: string;
  fields?: string[];
  conditions?: Record<string, any>;
};

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  isDefault: boolean;

  @IsArray()
  permissions: permissionsType[];
}
