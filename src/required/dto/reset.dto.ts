import { IsNotEmpty, isNotEmpty } from "class-validator"

export class reset {

    @IsNotEmpty()
    key : string
    
    @IsNotEmpty()
    newPass : string

    @IsNotEmpty()
    name : string
}