import * as mongoose from "mongoose";

export const passKey = new mongoose.Schema({
      
      player1address:{type:String},
      
      player2address:{type:String},

      client1id:{type:String},

      client2id:{type:String},

      token1:{type:Number},

      token2:{type:Number},
      
      gameid:{type:String},
      
      card1:{type:String},
      
      card2:{type:String},
      
      user1:{type:String},
      
      user2:{type:String},
      
      moves:{type:Array},
      
      playerWin:{type:Array},

      card1played:{type:Boolean},

      card2played:{type:Boolean},
   

})