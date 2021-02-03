import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator"

export class findUser{
    
    @IsNotEmpty()
    @ApiProperty({type: String , description: "Jwt Token"})
    jwt_token:string

    @IsNotEmpty()
    @ApiProperty({type: String , description: "Jwt Token"})
    key:string
    
  
  }