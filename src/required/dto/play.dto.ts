import { ApiProperty } from "@nestjs/swagger"

export class playDto{

    @ApiProperty({type: String , description: "card1"})
    card1:string
    
    @ApiProperty({type: String , description: "card2"})
    card2:string
    
    @ApiProperty({type: String , description: "user1"})
    user1:string
    
    @ApiProperty({type: String , description: "user2"})
    user2:string

}