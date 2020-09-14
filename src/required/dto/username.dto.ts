import { IsNotEmpty } from "class-validator"

export class username{
    
    @IsNotEmpty()
    username:string
    
    @IsNotEmpty()
    email:string
    
    @IsNotEmpty()
    publickey:string
    
    @IsNotEmpty()
    password:string
  
  }