import * as mongoose from 'mongoose'

export interface passkey extends mongoose.Document{
    name:string
    key:string
    card1:string
    gameid:string
    card2:string
    user1:string
    user2:string
    playerWin:string[]
}