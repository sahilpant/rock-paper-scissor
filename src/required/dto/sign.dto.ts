import { ApiOkResponse, ApiProperty } from "@nestjs/swagger";

export class signin {

    @ApiProperty({type: String , description: "email" })
    email : string

    @ApiProperty({type: String , description : "password"})
    password : string

}