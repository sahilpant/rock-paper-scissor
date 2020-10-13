import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, isNotEmpty } from "class-validator";

export class publickey{
    @IsNotEmpty()
    @ApiProperty({type:String, description:"publickey"})
    "publickey":string
}