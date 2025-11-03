import { Status } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTypeEntryDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsString()
    @IsNotEmpty()
    accountClearedId: string

    @IsString()
    @IsNotEmpty()
    status: Status
}
