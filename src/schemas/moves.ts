import * as mongoose from  'mongoose';
 export const match =new mongoose.Schema({
   gameid:{type:String},
   
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
    ]

})