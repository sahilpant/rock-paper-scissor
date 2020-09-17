import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, isNotEmpty } from "class-validator"

export class reset {

    @IsNotEmpty()
    @ApiProperty({type: String, description: "key"})
    key : string
    
    @IsNotEmpty()
    @ApiProperty({type: String , description: "newPss"})
    newPass : string

    @IsNotEmpty()
    @ApiProperty({type: String, description: "name"})
    name : string
}