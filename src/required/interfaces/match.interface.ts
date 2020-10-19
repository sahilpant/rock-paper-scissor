import * as mongoose from  'mongoose';

export interface match extends mongoose.Document{
	findMany(): any;
	findOne(): any;
    
    gameid:{type:String},
    match_type:{type:String},
    stars_of_player1:{type:Number},
    stars_of_player2:{type:Number | number},
    start_date:{type:Date},
    round:{type:Number},
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
    winner:{type:String},
 }