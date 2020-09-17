import { ApiOkResponse, ApiProperty } from "@nestjs/swagger";

export class signin {

    @ApiProperty({type: String , description: "name" })
    name : string

    @ApiProperty({type: String , description : "password"})
    password : string

}