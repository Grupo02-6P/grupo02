import { Status } from "@prisma/client"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreatePartnerDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    address: string

    @IsString()
    @IsNotEmpty()
    cnpj: string


    @IsOptional()
    status?: Status
}
