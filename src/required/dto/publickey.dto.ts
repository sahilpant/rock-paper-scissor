import { number } from "@hapi/joi";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, isNotEmpty } from "class-validator";

export class publickey{
    @IsNotEmpty()
    @ApiProperty({type:String, description:"publickey"})
    "publickey":string
}

export class Count{
    @IsNotEmpty()
    @ApiProperty({type:Number, description:"publickey"})
    "count":number
}