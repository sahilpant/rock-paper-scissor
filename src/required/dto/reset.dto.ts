import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, isNotEmpty } from "class-validator"

export class  reset {

    @IsNotEmpty()
    @ApiProperty({type: String, description: "key"})
    key : string
    
    @IsNotEmpty()
    @ApiProperty({type: String , description: "newPass"})
    newPass : string

    @IsNotEmpty()
    @ApiProperty({type: String, description: "email"})
    email : string
}