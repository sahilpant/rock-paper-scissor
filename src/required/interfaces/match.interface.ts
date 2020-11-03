import * as mongoose from  'mongoose';

export interface match extends mongoose.Document{
	findMany(): any;
	findOne(): any;
    
    gameid:String,
    match_type:{type:String},
    stars_of_player1:number,
    stars_of_player2:number,
    start_date:Date,
    round:number,
    player_joined:number,
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
        },
  
    }
    ],
    status:string,
    winner:String,
 }