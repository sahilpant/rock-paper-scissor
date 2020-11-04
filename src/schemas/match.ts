import { boolean, date, number, string } from '@hapi/joi';
import * as mongoose from  'mongoose';
import { type } from 'os';
 export const match =new mongoose.Schema({
    
    gameid:{type:String},
    match_type:{type:String},
    stars_of_player1:{type:Number},
    stars_of_player2:{type:Number},
    start_date:{type:Date},
    round:{type:Number },
    player_joined:{type:Number},
    live:{type:Boolean},
    player1:{
        username: String,
        publicaddress:String
    },
    player2:{
        username: String,
        publicaddress:String
    },
    Rounds:[
        {player1:{
            card_type:String,
            card_number:Number,
            timestamp:Date
        },
        player2:{
            card_type:String,
            card_number:Number,
            timestamp:Date
        }     
    }
    ],
    status:{type:String},
    winner:{type:String}
 })