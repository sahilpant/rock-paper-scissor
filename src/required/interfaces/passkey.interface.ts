import * as mongoose from 'mongoose'

export interface passkey extends mongoose.Document{
    
    player1address:string
    
    player2address:string

    client1id:string

    client2id:string

    token1:Number

    token2:Number
    
    card1:string
    
    gameid:string
    
    card2:string
    
    user1:string
    
    user2:string
    
    moves:string[]
    
    playerWin:string[]

    card1played:boolean

    card2played:boolean

}