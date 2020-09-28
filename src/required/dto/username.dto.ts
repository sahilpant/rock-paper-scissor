import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator"

export class username{
    
    @IsNotEmpty()
    @ApiProperty({type: String , description: "username"})
    username:string
    
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({type: String , description: "email"})

    email:string
    
    @IsNotEmpty()
    @ApiProperty({type: String , description: "publickey"})

    publickey:string
    
    @IsNotEmpty()
    @ApiProperty({type: String , description: "password"})

    password:string
  
  }