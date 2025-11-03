import { Status } from "@prisma/client"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateTypeMovementDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsString()
    @IsNotEmpty()
    creditAccountId: string

    @IsString()
    @IsNotEmpty()
    debitAccountId: string

    @IsString()
    @IsNotEmpty()
    status: Status
}
