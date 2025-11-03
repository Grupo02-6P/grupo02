import { Status } from "@prisma/client"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    code: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    description: string

    @IsNotEmpty()
    level: number

    @IsNotEmpty()
    acceptsPosting: boolean

    @IsNotEmpty()
    active: Status

    @IsString()
    parentAccountId: string | null
}